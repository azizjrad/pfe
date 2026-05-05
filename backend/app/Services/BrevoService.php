<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Logging\Log as Logger;
use Illuminate\Support\Facades\Mail;

class BrevoService
{
    private string $apiKey;
    private Logger $logger;

    public function __construct(Logger $logger)
    {
        $this->apiKey = env('BREVO_API_KEY', '');
        $this->logger = $logger;
    }

    /**
     * Send reservation contract email (renders Blade HTML and attaches PDF if possible)
     */
    public function sendReservationContract(Reservation $reservation): array
    {
        return $this->sendReservationContractNow($reservation);
    }

    /**
     * Send reservation contract email immediately (used by queue job handler).
     */
    public function sendReservationContractNow(Reservation $reservation): array
    {
        $user = $reservation->user;

        if (!$user || empty($user->email)) {
            return ['success' => false, 'response' => 'No recipient email'];
        }

        $subject = "Votre contrat de réservation #{$reservation->id}";

        return $this->sendBladeEmailNow(
            viewName: 'emails.contract',
            viewData: ['reservation' => $reservation],
            to: $user->email,
            subject: $subject,
            toName: $user->name ?? null,
            pdfView: 'emails.contract',
            pdfData: ['reservation' => $reservation],
            pdfFilename: "contract-{$reservation->id}.pdf"
        );
    }

    /**
     * Send account suspension / unsuspension email.
     */
    public function sendAccountStatusEmail(User $user, bool $suspended, ?string $reason = null): array
    {
        return $this->sendAccountStatusEmailNow($user, $suspended, $reason);
    }

    /**
     * Send account suspension / unsuspension email immediately (used by queue job handler).
     */
    public function sendAccountStatusEmailNow(User $user, bool $suspended, ?string $reason = null): array
    {
        if (empty($user->email)) {
            return ['success' => false, 'response' => 'No recipient email'];
        }

        $subject = $suspended
            ? 'Votre compte a été suspendu - Elite Drive'
            : 'Votre compte a été réactivé - Elite Drive';

        return $this->sendBladeEmailNow(
            viewName: 'emails.account-status',
            viewData: [
                'user' => $user,
                'suspended' => $suspended,
                'reason' => $reason,
            ],
            to: $user->email,
            subject: $subject,
            toName: $user->name ?? null
        );
    }

    /**
     * Render a Blade view and send it through the configured mailer.
     * Optionally attach a PDF generated from a Blade view.
     */
    public function sendBladeEmailNow(
        string $viewName,
        array $viewData,
        string $to,
        string $subject,
        ?string $toName = null,
        ?string $pdfView = null,
        array $pdfData = [],
        ?string $pdfFilename = null
    ): array {
        try {
            $html = view($viewName, $viewData)->render();
        } catch (\Throwable $e) {
            $this->logger->error('BrevoService: failed to render view ' . $viewName . ': ' . $e->getMessage());
            return ['success' => false, 'response' => 'Failed to render email view'];
        }

        try {
            $mailer = config('mail.default', 'failover');

            Mail::mailer($mailer)->send([], [], function ($message) use ($html, $to, $subject, $toName, $pdfView, $pdfData, $viewData, $pdfFilename) {
                $message->to($to, $toName);
                $message->subject($subject);
                $message->setBody($html, 'text/html');

                if ($pdfView !== null) {
                    $pdfHtml = view($pdfView, $pdfData ?: $viewData)->render();
                    if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf')) {
                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($pdfHtml)->setPaper('a4');
                        $message->attachData(
                            $pdf->output(),
                            $pdfFilename ?? 'document.pdf',
                            ['mime' => 'application/pdf']
                        );
                    }
                }
            });

            return ['success' => true, 'response' => 'sent'];
        } catch (\Throwable $e) {
            $this->logger->error('BrevoService: send failed: ' . $e->getMessage());
            return ['success' => false, 'response' => $e->getMessage()];
        }
    }
}
