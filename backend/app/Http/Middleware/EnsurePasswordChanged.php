<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Restrict API access for users flagged to change password on first login.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !(bool) $user->must_change_password) {
            return $next($request);
        }

        $allowed = [
            'api/logout',
            'api/user',
            'api/profile',
        ];

        if ($request->is($allowed)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Password change required before accessing this resource.',
            'error_code' => 'PASSWORD_CHANGE_REQUIRED',
        ], 403);
    }
}
