<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatbotMessageRequest;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbotService)
    {
    }

    /**
     * Generate chatbot reply using an OpenAI-compatible API provider.
     */
    public function reply(ChatbotMessageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $reply = $this->chatbotService->generateReply(
                $validated['message'],
                $validated['history'] ?? []
            );

            return $this->apiSuccessResponse(null, [
                'reply' => $reply,
            ]);
        } catch (\RuntimeException $exception) {
            return $this->apiErrorMessageResponse($exception->getMessage(), 503);
        } catch (\Throwable $exception) {
            Log::error('Chatbot reply failed', [
                'error' => $exception->getMessage(),
            ]);

            return $this->apiErrorMessageResponse('Le service chatbot est temporairement indisponible.', 500);
        }
    }
}
