<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Validation avec support des rôles (client ou agency_admin)
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
            // Champs spécifiques pour les admins d'agence
            'agency_name' => 'required_if:role,agency_admin|string|max:255',
            'agency_location' => 'required_if:role,agency_admin|string|max:255',
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&).',
        ]);

        // Création de l'utilisateur
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? null,
            'driver_license' => $validated['driver_license'] ?? null,
        ]);

        // Si c'est un admin d'agence, créer l'agence
        if ($validated['role'] === 'agency_admin') {
            $agency = \App\Models\Agency::create([
                'name' => $validated['agency_name'],
                'location' => $validated['agency_location'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'address' => $validated['address'] ?? '',
            ]);

            // Lier l'utilisateur à l'agence
            $user->agency_id = $agency->id;
            $user->save();
        }

        // Créer le score de fiabilité pour les clients
        if ($validated['role'] === 'client') {
            \App\Models\ClientReliabilityScore::create([
                'user_id' => $user->id,
                'score' => 100, // Score initial parfait
                'last_calculated_at' => now(),
            ]);
        }

        // Générer le token d'authentification Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Définir la durée du cookie (30 jours par défaut pour inscription)
        $cookieExpiration = 60 * 24 * 30; // 30 jours en minutes

        return response()->json([
            'message' => 'Inscription réussie',
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
            'auth_token',           // Cookie name
            $token,                 // Token value
            $cookieExpiration,      // Expiration in minutes
            '/',                    // Path
            null,                   // Domain
            false,                  // Secure (true for HTTPS in production)
            true,                   // HttpOnly
            false,                  // Raw
            'lax'                   // SameSite
        );
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember_me' => 'sometimes|boolean',
        ], [
            'email.required' => 'L\'adresse e-mail est requise.',
            'email.email' => 'L\'adresse e-mail doit être valide.',
            'password.required' => 'Le mot de passe est requis.',
        ]);

        // Chercher l'utilisateur avec ses relations
        $user = User::where('email', $request->email)->first();

        // Vérifier si l'utilisateur existe
        if (!$user) {
            Log::warning('Failed login attempt - User not found', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Aucun compte n\'existe avec cette adresse e-mail.'],
            ]);
        }

        // Vérifier le mot de passe
        if (!Hash::check($request->password, $user->password)) {
            Log::warning('Failed login attempt - Invalid password', [
                'email' => $request->email,
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }

        // Limite de sessions simultanées (max 3 appareils)
        $existingTokens = $user->tokens()->count();
        if ($existingTokens >= 3) {
            // Supprimer le token le plus ancien
            $user->tokens()->oldest()->limit(1)->delete();

            Log::info('Session limit reached - Oldest token removed', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        // Créer un nouveau token avec metadata
        $token = $user->createToken('auth_token', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ])->plainTextToken;

        Log::info('Successful login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        // Charger les relations nécessaires
        $user->load('agency', 'reliabilityScore');

        // Définir la durée du cookie selon "Remember Me"
        $rememberMe = $request->input('remember_me', false);
        $cookieExpiration = $rememberMe ? (60 * 24 * 30) : (60 * 2); // 30 jours ou 2 heures

        return response()->json([
            'message' => 'Connexion réussie',
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
            'auth_token',           // Cookie name
            $token,                 // Token value
            $cookieExpiration,      // Expiration in minutes
            '/',                    // Path
            null,                   // Domain
            false,                  // Secure (true for HTTPS in production)
            true,                   // HttpOnly
            false,                  // Raw
            'lax'                   // SameSite
        );
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        // Supprimer le cookie en définissant une expiration passée
        return response()->json([
            'message' => 'Déconnexion réussie',
        ])->cookie(
            'auth_token',
            '',                     // Valeur vide
            -1,                     // Expiration dans le passé
            '/',
            null,
            false,
            true,
            false,
            'lax'
        );
    }

    /**
     * Get authenticated user details.
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
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validation rules
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
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
        ];

        $messages = [
            'new_password.regex' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un symbole.',
            'current_password.required_with' => 'Le mot de passe actuel est requis pour changer le mot de passe.',
            'phone.size' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
        ];

        $validated = $request->validate($rules, $messages);

        // Verify current password if changing password
        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect',
                    'errors' => [
                        'current_password' => ['Le mot de passe actuel est incorrect']
                    ]
                ], 422);
            }

            $user->password = Hash::make($validated['new_password']);

            // Log password change
            Log::info('Password changed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        // Update user fields
        if ($request->filled('name')) {
            $user->name = $validated['name'];
        }
        if ($request->filled('email')) {
            $user->email = $validated['email'];
        }
        if ($request->filled('phone')) {
            $user->phone = $validated['phone'];
        }
        if ($request->has('address')) {
            $user->address = $validated['address'];
        }
        if ($request->has('driver_license')) {
            $user->driver_license = $validated['driver_license'];
        }

        $user->save();

        // Reload relationships
        $user->load('agency', 'reliabilityScore');

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
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
    }
}
