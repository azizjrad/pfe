<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    private function cookieSecureFlag(): bool
    {
        $secure = config('session.secure');

        if ($secure === null) {
            return app()->environment('production');
        }

        return (bool) $secure;
    }

    private function withAuthCookie($response, string $token, int $minutes)
    {
        return $response->cookie(
            'auth_token',
            $token,
            $minutes,
            config('session.path', '/'),
            config('session.domain'),
            $this->cookieSecureFlag(),
            true,
            false,
            (string) (config('session.same_site') ?? 'lax')
        );
    }

    private function clearAuthCookie($response)
    {
        return $response->cookie(
            'auth_token',
            '',
            -1,
            config('session.path', '/'),
            config('session.domain'),
            $this->cookieSecureFlag(),
            true,
            false,
            (string) (config('session.same_site') ?? 'lax')
        );
    }

    /**
     * Reset password using token (used by invite links)
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password set successfully'], 200);
        }

        return response()->json(['message' => 'Failed to reset password'], 400);
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        try {
            $user = $this->authService->register($validated);
            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->withAuthCookie(response()->json([
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'driver_license' => $user->driver_license,
                    'agency_id' => $user->agency_id,
                ],
            ], 201), $token, 60 * 24 * 30);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Registration failed', 422, [
                'action' => 'register',
            ]);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        try {
            $result = $this->authService->login(
                $validated['email'],
                $validated['password'],
                (bool) ($validated['remember_me'] ?? false)
            );

            $user = $result['user'];
            $token = $result['token'];
            $cookieExpiration = $result['cookie_expiration'];

            return $this->withAuthCookie(response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'driver_license' => $user->driver_license,
                    'agency_id' => $user->agency_id,
                    'agency' => $user->agency ? [
                        'id' => $user->agency->id,
                        'name' => $user->agency->name,
                        'location' => $user->agency->location,
                    ] : null,
                    'client_score' => $user->reliabilityScore?->score ?? null,
                ],
            ]), $token, $cookieExpiration);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return $this->clearAuthCookie(response()->json([
            'message' => 'Logout successful',
        ]));
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load('agency', 'reliabilityScore');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'driver_license' => $user->driver_license,
                'agency_id' => $user->agency_id,
                'agency' => $user->agency ? [
                    'id' => $user->agency->id,
                    'name' => $user->agency->name,
                    'location' => $user->agency->location,
                ] : null,
                'client_score' => $user->reliabilityScore?->score ?? null,
                'created_at' => $user->created_at->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $validated = $request->validated();

        try {
            $user = $this->authService->updateProfile($request->user(), $validated);
            $user->load('agency', 'reliabilityScore');

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'driver_license' => $user->driver_license,
                    'agency_id' => $user->agency_id,
                    'agency' => $user->agency ? [
                        'id' => $user->agency->id,
                        'name' => $user->agency->name,
                        'location' => $user->agency->location,
                    ] : null,
                    'client_score' => $user->reliabilityScore?->score ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Profile update failed', 422, [
                'action' => 'update_profile',
                'user_id' => $request->user()?->id,
            ]);
        }
    }
}
