<?php

namespace App\Services;

use App\Domain\Enums\VehicleStatus;
use App\Models\Vehicle;
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
        $inventoryContext = $this->buildInventoryContext($userMessage);

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

        $conversation = [
            [
                'role' => 'system',
                'content' => $systemPrompt,
            ],
        ];

        if ($inventoryContext !== null) {
            $conversation[] = [
                'role' => 'system',
                'content' => $inventoryContext,
            ];
        }

        $conversation = array_merge(
            $conversation,
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

    /**
     * Build a small inventory context block for Gemini when the user asks about vehicles.
     */
    private function buildInventoryContext(string $userMessage): ?string
    {
        $normalizedMessage = $this->normalizeText($userMessage);

        if (!$this->looksLikeVehicleAvailabilityQuestion($normalizedMessage)) {
            return null;
        }

        $brand = $this->detectBrandFromInventory($normalizedMessage);

        if ($brand !== null) {
            $availableVehicles = Vehicle::query()
                ->whereRaw('LOWER(brand) = ?', [$brand])
                ->where('status', VehicleStatus::AVAILABLE->value)
                ->orderBy('daily_price')
                ->limit(5)
                ->get(['brand', 'model', 'year', 'daily_price']);

            $availableCount = Vehicle::query()
                ->whereRaw('LOWER(brand) = ?', [$brand])
                ->where('status', VehicleStatus::AVAILABLE->value)
                ->count();

            if ($availableCount === 0) {
                return "Inventory context: the user asked about {$brand}. There are currently no available vehicles of this brand.";
            }

            $examples = $availableVehicles
                ->map(fn (Vehicle $vehicle) => trim(sprintf('%s %s (%s) - %.2f DT/jour', ucfirst($vehicle->brand), $vehicle->model, $vehicle->year, (float) $vehicle->daily_price)))
                ->implode(', ');

            return sprintf(
                'Inventory context: the user asked about %s. Available vehicles: %d. Examples: %s.',
                ucfirst($brand),
                $availableCount,
                $examples !== '' ? $examples : 'none'
            );
        }

        $availableBrands = Vehicle::query()
            ->where('status', VehicleStatus::AVAILABLE->value)
            ->selectRaw('LOWER(brand) as brand, COUNT(*) as count')
            ->groupByRaw('LOWER(brand)')
            ->orderBy('brand')
            ->get();

        if ($availableBrands->isEmpty()) {
            return 'Inventory context: there are currently no available vehicles.';
        }

        $brandsText = $availableBrands
            ->map(fn ($item) => ucfirst($item->brand) . ' (' . $item->count . ')')
            ->implode(', ');

        return 'Inventory context: currently available brands are ' . $brandsText . '. If the user asks about a specific brand, answer using this stock information.';
    }

    /**
     * Determine whether the user is asking about vehicle availability or brands.
     */
    private function looksLikeVehicleAvailabilityQuestion(string $message): bool
    {
        $negativeKeywords = [
            'horaire',
            'ouvert',
            'ouverture',
            'ferme',
            'fermeture',
            'reserver',
            'reservation',
            'contact',
            'adresse',
            'prix',
            'tarif',
            'comment',
            'booking',
        ];

        foreach ($negativeKeywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return false;
            }
        }

        $inventoryPatterns = [
            'voiture disponible',
            'voitures disponibles',
            'vehicule disponible',
            'vehicules disponibles',
            'marque disponible',
            'marques disponibles',
            'quelles marques',
            'quelle marque',
            'avez vous',
            'avez-vous',
            'have you',
            'disponibilite',
            'disponible',
        ];

        foreach ($inventoryPatterns as $pattern) {
            if (str_contains($message, $pattern)) {
                return true;
            }
        }

        return $this->detectBrandFromInventory($message) !== null;
    }

    /**
     * Try to find a brand mentioned in the message from the inventory.
     */
    private function detectBrandFromInventory(string $message): ?string
    {
        $brands = Vehicle::query()
            ->selectRaw('DISTINCT LOWER(brand) as brand')
            ->orderBy('brand')
            ->pluck('brand')
            ->filter()
            ->values();

        foreach ($brands as $brand) {
            if ($brand !== '' && str_contains($message, $brand)) {
                return $brand;
            }
        }

        return null;
    }

    /**
     * Normalize text for simple keyword matching.
     */
    private function normalizeText(string $text): string
    {
        $text = strtolower(trim($text));

        $replacements = [
            'à' => 'a',
            'â' => 'a',
            'ä' => 'a',
            'ç' => 'c',
            'é' => 'e',
            'è' => 'e',
            'ê' => 'e',
            'ë' => 'e',
            'î' => 'i',
            'ï' => 'i',
            'ô' => 'o',
            'ö' => 'o',
            'ù' => 'u',
            'û' => 'u',
            'ü' => 'u',
            'ÿ' => 'y',
        ];

        return strtr($text, $replacements);
    }
}
