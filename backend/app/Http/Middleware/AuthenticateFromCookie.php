<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateFromCookie
{
    /**
     * Handle an incoming request.
     *
     * This middleware adds the token from the cookie to the Authorization header
     * so that Sanctum can authenticate the user normally.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if there's a token in the cookie
        $token = $request->cookie('auth_token');

        // If token exists in cookie and no Authorization header is set
        if ($token && !$request->bearerToken()) {
            // Add the token to the Authorization header
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}
