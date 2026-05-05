<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotSuspended
{
    /**
     * Block suspended users from accessing authenticated API routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if (!(bool) $user->is_suspended) {
            return $next($request);
        }

        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        Log::warning('Blocked request from suspended user', [
            'user_id' => $user->id,
            'path' => $request->path(),
            'method' => $request->method(),
        ]);

        return response()->json([
            'success' => false,
            'message' => __('auth.account_suspended'),
        ], 403);
    }
}
