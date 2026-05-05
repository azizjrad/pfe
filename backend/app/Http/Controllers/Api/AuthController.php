<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResetPasswordRequest;
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
    public function resetPassword(ResetPasswordRequest $request)
    {
        $validated = $request->validated();

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return $this->apiSuccessResponse(__('auth.password_set_success'));
        }

        return $this->apiErrorMessageResponse(__('auth.failed_reset_password'), 400);
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = $this->authService->register($validated);
        return $this->apiSuccessResponse(__('auth.registration_success'), [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'must_change_password' => (bool) $user->must_change_password,
                'phone' => $user->phone,
                'address' => $user->address,
                'driver_license' => $user->driver_license,
                'agency_id' => $user->agency_id,
                'email_verified' => true,
            ],
        ], 201);
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

            return $this->withAuthCookie($this->apiSuccessResponse(__('auth.login_success'), [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'must_change_password' => (bool) $user->must_change_password,
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

        return $this->clearAuthCookie($this->apiSuccessResponse(__('auth.logout_success')));
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load('agency', 'reliabilityScore');

        return $this->apiSuccessResponse(null, [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                    'must_change_password' => (bool) $user->must_change_password,
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

        $user = $this->authService->updateProfile($request->user(), $validated);
        $user->load('agency', 'reliabilityScore');

        return $this->apiSuccessResponse(__('auth.profile_updated'), [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                    'must_change_password' => (bool) $user->must_change_password,
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
    }

}
