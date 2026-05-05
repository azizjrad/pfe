<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Part\DataPart;

class BrevoTransport extends AbstractTransport
{
    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $endpoint = 'https://api.brevo.com/v3/smtp/email'
    ) {
        parent::__construct();
    }

    public function __toString(): string
    {
        return 'brevo-api';
    }

    protected function doSend(SentMessage $message): void
    {
        if (empty($this->apiKey)) {
            throw new TransportException('Brevo API key is missing.');
        }

        $email = $message->getOriginalMessage();

        if (!$email instanceof Email) {
            throw new TransportException('Unsupported message type for Brevo API transport.');
        }

        $payload = [
            'sender' => $this->formatAddress($email->getFrom()[0] ?? null),
            'to' => $this->formatAddresses($email->getTo()),
            'subject' => (string) $email->getSubject(),
            'htmlContent' => $email->getHtmlBody() ? (string) $email->getHtmlBody() : null,
            'textContent' => $email->getTextBody() ? (string) $email->getTextBody() : null,
        ];

        if ($cc = $this->formatAddresses($email->getCc())) {
            $payload['cc'] = $cc;
        }

        if ($bcc = $this->formatAddresses($email->getBcc())) {
            $payload['bcc'] = $bcc;
        }

        $attachments = [];
        foreach ($email->getAttachments() as $attachment) {
            if (!$attachment instanceof DataPart) {
                continue;
            }

            $attachments[] = [
                'name' => $attachment->getFilename() ?? 'attachment',
                'content' => base64_encode($attachment->getBody()),
            ];
        }

        if ($attachments !== []) {
            $payload['attachment'] = $attachments;
        }

        $payload = array_filter($payload, static fn ($value) => $value !== null && $value !== []);

        $response = Http::withHeaders([
            'api-key' => $this->apiKey,
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->post($this->endpoint, $payload);

        if (!$response->successful()) {
            throw new TransportException(sprintf(
                'Brevo API request failed with status %d: %s',
                $response->status(),
                $response->body()
            ));
        }

        $brevoMessageId = $response->json('messageId');
        if (is_string($brevoMessageId) && $brevoMessageId !== '') {
            $message->setMessageId($brevoMessageId);
        }
    }

    private function formatAddress(?Address $address): ?array
    {
        if ($address === null) {
            return null;
        }

        return [
            'email' => $address->getAddress(),
            'name' => $address->getName() !== '' ? $address->getName() : null,
        ];
    }

    /**
     * @param Address[] $addresses
     * @return array<int, array{email: string, name: ?string}>
     */
    private function formatAddresses(array $addresses): array
    {
        return array_values(array_filter(array_map(fn (Address $address) => $this->formatAddress($address), $addresses)));
    }
}
