<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'role' => 'required|in:client,agency_admin',
            'phone' => 'required|string|size:8',
            'address' => 'nullable|string|max:500',
            'driver_license' => 'nullable|string|max:50',
            'agency_name' => 'required_if:role,agency_admin|string|max:255',
            'agency_location' => 'required_if:role,agency_admin|string|max:255',
        ], [
            'password.regex' => 'Password must contain at least one lowercase, one uppercase, one digit and one special character (@$!%*?&).',
        ]);

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
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember_me' => 'sometimes|boolean',
        ]);

        try {
            $result = $this->authService->login(
                $request->email,
                $request->password,
                $request->boolean('remember_me', false)
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
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'sometimes|required|string|size:8',
            'address' => 'nullable|string|max:500',
            'driver_license' => 'nullable|string|max:50',
            'current_password' => 'required_with:new_password',
            'new_password' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
        ]);

        try {
            $user = $this->authService->updateProfile($request->user(), $request->all());
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
