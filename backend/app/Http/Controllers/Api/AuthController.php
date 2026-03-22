<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
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

            return response()->json([
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
            ], 201)->cookie(
                'auth_token',
                $token,
                60 * 24 * 30,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 422);
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

            return response()->json([
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
            ])->cookie(
                'auth_token',
                $token,
                $cookieExpiration,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );
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

        return response()->json([
            'message' => 'Logout successful',
        ])->cookie(
            'auth_token',
            '',
            -1,
            '/',
            null,
            false,
            true,
            false,
            'lax'
        );
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
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['current_password' => [$e->getMessage()]],
            ], 422);
        }
    }
}
