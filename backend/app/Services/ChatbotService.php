<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ChatbotService
{
    private const MAX_CONTEXT_MESSAGES = 10;

    /**
     * Generate chatbot response from OpenAI-compatible provider.
     *
     * @throws \RuntimeException
     */
    public function generateReply(string $userMessage, array $history = []): string
    {
        $config = config('services.gemini_compatible', config('services.openai_compatible', []));

        $apiKey = (string) ($config['api_key'] ?? '');
        $baseUrl = rtrim((string) ($config['base_url'] ?? ''), '/');
        $model = (string) ($config['model'] ?? '');

        if ($apiKey === '' || $baseUrl === '' || $model === '') {
            throw new \RuntimeException('Chatbot API is not configured. Set GEMINI_API_KEY, GEMINI_BASE_URL and GEMINI_MODEL.');
        }

        $siteUrl = (string) ($config['site_url'] ?? '');
        $siteName = (string) ($config['site_name'] ?? '');
        $systemPrompt = (string) ($config['system_prompt'] ?? 'Tu es un assistant utile et concis pour une plateforme de location de voitures. Réponds en français.');

        $request = Http::timeout(30)
            ->acceptJson()
            ->withToken($apiKey);

        // OpenRouter supports these optional ranking headers.
        if ($siteUrl !== '') {
            $request = $request->withHeaders(['HTTP-Referer' => $siteUrl]);
        }
        if ($siteName !== '') {
            $request = $request->withHeaders(['X-Title' => $siteName]);
        }

        $conversation = array_merge(
            [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
            ],
            $this->sanitizeHistory($history),
            [
                [
                    'role' => 'user',
                    'content' => $userMessage,
                ],
            ]
        );

        $response = $request->post($baseUrl . '/chat/completions', [
            'model' => $model,
            'messages' => $conversation,
            'temperature' => 0.4,
            'max_tokens' => 300,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Chatbot provider request failed with status ' . $response->status() . '.');
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        if (is_array($content)) {
            $content = collect($content)
                ->map(fn ($part) => is_array($part) ? ($part['text'] ?? '') : '')
                ->filter()
                ->implode("\n");
        }

        $reply = trim((string) $content);

        if ($reply === '') {
            throw new \RuntimeException('Chatbot provider returned an empty response.');
        }

        return $reply;
    }

    /**
     * Keep only valid recent history items expected by chat-completions API.
     */
    private function sanitizeHistory(array $history): array
    {
        return collect($history)
            ->filter(fn ($item) => is_array($item))
            ->map(fn ($item) => [
                'role' => in_array($item['role'] ?? '', ['user', 'assistant'], true)
                    ? $item['role']
                    : null,
                'content' => trim((string) ($item['content'] ?? '')),
            ])
            ->filter(fn ($item) => !empty($item['role']) && $item['content'] !== '')
            ->take(-self::MAX_CONTEXT_MESSAGES)
            ->values()
            ->all();
    }
}
