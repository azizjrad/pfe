<?php

namespace App\Http\Controllers;

use App\Exceptions\Domain\DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Return a standardized API success payload.
     */
    protected function apiSuccessResponse(
        ?string $message = null,
        mixed $data = null,
        int $status = 200,
        array $extra = []
    ): JsonResponse {
        $payload = array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $extra);

        return response()->json($payload, $status);
    }

    /**
     * Return a standardized API error payload for known business-rule failures.
     */
    protected function apiErrorMessageResponse(
        string $message,
        int $status = 400,
        array $extra = []
    ): JsonResponse {
        return response()->json(array_merge([
            'success' => false,
            'message' => $message,
        ], $extra), $status);
    }

    /**
     * Return a standardized API error payload without leaking internals.
     */
    protected function apiErrorResponse(
        Throwable $exception,
        string $message,
        int $status = 500,
        array $context = []
    ): JsonResponse {
        if ($exception instanceof DomainException) {
            Log::warning($exception->getMessage(), array_merge($context, [
                'exception' => get_class($exception),
                'error_code' => $exception->getErrorCode(),
            ]));

            $payload = [
                'success' => false,
                'message' => $exception->getMessage(),
            ];

            if ($exception->getErrorCode()) {
                $payload['error_code'] = $exception->getErrorCode();
            }

            return response()->json($payload, $exception->getStatus());
        }

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

    /**
     * Resolve a bounded per-page value from request query params.
     */
    protected function resolvePerPage(Request $request, int $default = 20, int $max = 100): int
    {
        $perPage = (int) $request->query('per_page', $default);

        if ($perPage < 1) {
            return $default;
        }

        return min($perPage, $max);
    }

    /**
     * Standard pagination metadata payload.
     */
    protected function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'has_more_pages' => $paginator->hasMorePages(),
        ];
    }
}
