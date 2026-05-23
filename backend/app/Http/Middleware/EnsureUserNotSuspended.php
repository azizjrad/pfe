<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ClientReliabilityScore;
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
            // For clients, block all authenticated website/API access when score
            // reaches the hard block threshold (<= 29).
            if ($user->role === 'client') {
                $score = ClientReliabilityScore::where('user_id', $user->id)->value('reliability_score');
                $hardBlockThreshold = (int) config('pfe.reliability_scoring.blocked_threshold', 30);

                if ($score !== null && (int) $score < $hardBlockThreshold) {
                    if ($user->currentAccessToken()) {
                        $user->currentAccessToken()->delete();
                    }

                    Log::warning('Blocked request from low-score client', [
                        'user_id' => $user->id,
                        'score' => (int) $score,
                        'threshold' => $hardBlockThreshold,
                        'path' => $request->path(),
                        'method' => $request->method(),
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => __('auth.account_blocked_low_score'),
                        'error_code' => 'CLIENT_BLOCKED_LOW_SCORE',
                    ], 403);
                }
            }

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
