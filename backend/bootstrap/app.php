<?php

use App\Exceptions\Domain\DomainException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS middleware handles cross-origin requests from React frontend
        // AuthenticateFromCookie extracts token from HttpOnly cookie for Sanctum
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\AuthenticateFromCookie::class,
        ]);

        // Register role middleware alias for route protection
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'not_suspended' => \App\Http\Middleware\EnsureUserNotSuspended::class,
            'password_changed' => \App\Http\Middleware\EnsurePasswordChanged::class,
            'verified_email' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (ValidationException $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => __('messages.validation_failed'),
                'errors' => $exception->errors(),
            ], $exception->status);
        });

        $exceptions->render(function (AuthenticationException $exception) {
            return response()->json([
                'success' => false,
                'message' => __('messages.unauthenticated'),
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: __('messages.forbidden'),
            ], 403);
        });

        $exceptions->render(function (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => __('messages.resource_not_found'),
            ], 404);
        });

        $exceptions->render(function (DomainException $exception) {
            $payload = [
                'success' => false,
                'message' => $exception->getMessage(),
            ];

            if ($exception->getErrorCode()) {
                $payload['error_code'] = $exception->getErrorCode();
            }

            return response()->json($payload, $exception->getStatus());
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            $errorId = (string) Str::uuid();
            Log::error('Unhandled API exception', [
                'error_id' => $errorId,
                'exception' => get_class($exception),
                'message' => $exception->getMessage(),
                'path' => $request->path(),
            ]);

            $payload = [
                'success' => false,
                'message' => 'Une erreur interne est survenue.',
                'error_id' => $errorId,
            ];

            if (config('app.debug')) {
                $payload['debug'] = $exception->getMessage();
            }

            return response()->json($payload, 500);
        });
    })->create();
