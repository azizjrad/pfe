<?php

namespace App\Services;

use App\Models\User;
use App\Models\Agency;
use App\Models\ClientReliabilityScore;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user (client or agency_admin)
     * Auto-creates agency for agency_admin and reliability score for clients
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'phone' => $data['phone'],
            'address' => $data['address'] ?? null,
            'driver_license' => $data['driver_license'] ?? null,
        ]);

        // Auto-create agency for agency_admin users
        if ($data['role'] === 'agency_admin') {
            $agency = Agency::create([
                'name' => $data['agency_name'],
                'location' => $data['agency_location'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'address' => $data['address'] ?? '',
            ]);

            $user->update(['agency_id' => $agency->id]);
        }

        // Initialize reliability score for clients (starts at 100)
        if ($data['role'] === 'client') {
            ClientReliabilityScore::create([
                'user_id' => $user->id,
                'score' => 100,
                'last_calculated_at' => now(),
            ]);
        }

        return $user->load('agency', 'reliabilityScore');
    }

    /**
     * Authenticate user and create token
     * Limits to 3 concurrent sessions
     */
    public function login(string $email, string $password, bool $rememberMe = false): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::warning('Failed login - User not found', ['email' => $email]);
            throw new \Exception('Invalid email or password.');
        }

        if (!Hash::check($password, $user->password)) {
            Log::warning('Failed login - Invalid password', ['user_id' => $user->id, 'email' => $email]);
            throw new \Exception('Invalid email or password.');
        }

        // Limit sessions to 3 devices
        if ($user->tokens()->count() >= 3) {
            $user->tokens()->oldest()->limit(1)->delete();
            Log::info('Session limit reached', ['user_id' => $user->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Successful login', ['user_id' => $user->id, 'email' => $email]);

        $cookieExpiration = $rememberMe ? (60 * 24 * 30) : (60 * 2); // 30d or 2h

        $user->load('agency', 'reliabilityScore');

        return [
            'user' => $user,
            'token' => $token,
            'cookie_expiration' => $cookieExpiration,
        ];
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
        Log::info('User logged out', ['user_id' => $user->id]);
    }

    /**
     * Update user profile with validation
     */
    public function updateProfile(User $user, array $data): User
    {
        // Verify current password if changing password
        if (isset($data['new_password'])) {
            if (!isset($data['current_password']) || !Hash::check($data['current_password'], $user->password)) {
                throw new \Exception('Current password is incorrect.');
            }
            $data['password'] = Hash::make($data['new_password']);
            unset($data['new_password'], $data['current_password']);
        }

        if (isset($data['new_email']) && $data['new_email'] !== $user->email) {
            $data['email'] = $data['new_email'];
            unset($data['new_email']);
        }

        $user->update($data);
        return $user->loadMissing('agency', 'reliabilityScore');
    }

    /**
     * Refresh authentication token
     */
    public function refreshToken(User $user): string
    {
        $user->currentAccessToken()->delete();
        return $user->createToken('auth_token')->plainTextToken;
    }
}
