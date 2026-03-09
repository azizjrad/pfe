<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles - Allowed roles (client, agency_admin, super_admin)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Reject unauthenticated requests immediately
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Verify user has at least one of the required roles (authorization check)
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Access denied. Insufficient permissions.',
                'required_roles' => $roles,
                'user_role' => $request->user()->role,
            ], 403);
        }

        return $next($request);
    }
}
