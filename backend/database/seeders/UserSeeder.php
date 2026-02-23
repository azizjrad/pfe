<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin
        User::create([
            'name' => 'Administrateur Principal',
            'email' => 'admin@location.tn',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'agency_id' => null,
            'phone' => '+216 71 000 000',
            'address' => 'Tunis, Tunisie',
            'driver_license' => null,
            'email_verified_at' => now(),
        ]);

        // Agency Admins (one per agency)
        User::create([
            'name' => 'Ahmed Ben Ali',
            'email' => 'ahmed.tunis@location.tn',
            'password' => Hash::make('password'),
            'role' => 'agency_admin',
            'agency_id' => 1, // Agence Tunis Centre
            'phone' => '+216 71 111 111',
            'address' => 'Tunis',
            'driver_license' => null,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Fatma Mejri',
            'email' => 'fatma.aeroport@location.tn',
            'password' => Hash::make('password'),
            'role' => 'agency_admin',
            'agency_id' => 2, // Agence Aéroport
            'phone' => '+216 71 222 222',
            'address' => 'Tunis',
            'driver_license' => null,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Mohamed Trabelsi',
            'email' => 'mohamed.sousse@location.tn',
            'password' => Hash::make('password'),
            'role' => 'agency_admin',
            'agency_id' => 3, // Agence Sousse
            'phone' => '+216 73 333 333',
            'address' => 'Sousse',
            'driver_license' => null,
            'email_verified_at' => now(),
        ]);

        // Clients
        User::create([
            'name' => 'Sami Jrad',
            'email' => 'sami.jrad@email.tn',
            'password' => Hash::make('password'),
            'role' => 'client',
            'agency_id' => null,
            'phone' => '+216 98 123 456',
            'address' => '12 Rue de la Liberté, Tunis',
            'driver_license' => 'TN123456',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Amira Gharbi',
            'email' => 'amira.gharbi@email.tn',
            'password' => Hash::make('password'),
            'role' => 'client',
            'agency_id' => null,
            'phone' => '+216 98 234 567',
            'address' => '45 Avenue Habib Bourguiba, Sousse',
            'driver_license' => 'TN234567',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Karim Bouazizi',
            'email' => 'karim.bouazizi@email.tn',
            'password' => Hash::make('password'),
            'role' => 'client',
            'agency_id' => null,
            'phone' => '+216 98 345 678',
            'address' => '78 Rue de Sfax, Tunis',
            'driver_license' => 'TN345678',
            'email_verified_at' => now(),
        ]);
    }
}
