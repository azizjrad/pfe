<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => __('messages.unauthenticated'),
                'data' => null,
            ], 401);
        }

        if ($user->email_verified_at === null) {
            return response()->json([
                'success' => false,
                'message' => __('auth.email_not_verified'),
                'data' => [
                    'email' => $user->email,
                    'requires_verification' => true,
                ],
            ], 403);
        }

        return $next($request);
    }
}
