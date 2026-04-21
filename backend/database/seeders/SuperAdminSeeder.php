<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the super admin account.
     */
    public function run(): void
    {
        if (app()->environment('production') && !filter_var((string) env('ALLOW_PRODUCTION_SEEDERS', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->warn('SuperAdminSeeder is blocked in production. Use admin:bootstrap instead.');
            return;
        }

        // Supprimer l'admin existant si présent (pour éviter les doublons)
        User::where('email', 'admin@elitedrive.com')->delete();

        // Créer le compte Super Admin
        $superAdmin = User::create([
            'name' => 'Elite Drive Admin',
            'email' => 'admin@elitedrive.com',
            'password' => Hash::make('Admin2024!'),
            'role' => 'super_admin',
            'must_change_password' => false,
            'phone' => '70000000',
            'address' => 'Tunis, Tunisie',
            'driver_license' => null,
            'agency_id' => null,
            'email_verified_at' => now(),
        ]);

        // Créer un token pour le super admin (optionnel)
        $token = $superAdmin->createToken('super_admin_token')->plainTextToken;

        $this->command->info('✅ Super Admin créé avec succès !');
        $this->command->info('📧 Email: admin@elitedrive.com');
        $this->command->info('🔑 Mot de passe: Admin2024!');
        $this->command->info('🎫 Token: ' . $token);
        $this->command->warn('⚠️  IMPORTANT: Changez le mot de passe en production !');
    }
}
