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
     * @param  string  ...$roles - Roles autorisés (client, agency_admin, super_admin)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!$request->user()) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401);
        }

        // Vérifier si l'utilisateur a l'un des rôles autorisés
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé. Permissions insuffisantes.',
                'required_roles' => $roles,
                'user_role' => $request->user()->role,
            ], 403);
        }

        return $next($request);
    }
}
