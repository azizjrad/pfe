<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Return a standardized API error payload without leaking internals.
     */
    protected function apiErrorResponse(
        Throwable $exception,
        string $message,
        int $status = 500,
        array $context = []
    ): JsonResponse {
        $errorId = (string) Str::uuid();

        Log::error($message, array_merge($context, [
            'error_id' => $errorId,
            'exception' => get_class($exception),
            'exception_message' => $exception->getMessage(),
        ]));

        $payload = [
            'success' => false,
            'message' => $message,
            'error_id' => $errorId,
        ];

        if (config('app.debug')) {
            $payload['debug'] = $exception->getMessage();
        }

        return response()->json($payload, $status);
    }
}
