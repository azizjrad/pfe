<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Agency;
use App\Models\User;
use App\Models\Vehicle;

class DemoAgencySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Agency
        $agency = Agency::create([
            'name' => 'Azur Cars Tunis',
            'address' => 'Rue de Marseille, Tunis',
            'city' => 'Tunis',
            'phone' => '71234567',
            'email' => 'azur.tunis@example.com',
            'opening_time' => '08:00',
            'closing_time' => '18:00',
            'status' => 'active',
        ]);

        // 2. Create Agency Admin
        $admin = User::create([
            'name' => 'Karim Azizi',
            'email' => 'karim.azizi@example.com',
            'password' => Hash::make('Agence2026!'),
            'role' => 'agency_admin',
            'agency_id' => $agency->id,
            'phone' => '20111222',
            'address' => 'Tunis',
            'email_verified_at' => now(),
        ]);

        // 3. Add Vehicles
        $vehicles = [
            [
                'brand' => 'Renault',
                'model' => 'Clio',
                'year' => 2022,
                'mileage' => 15000,
                'daily_price' => 120.00,
                'license_plate' => '123TU4567',
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'agency_id' => $agency->id,
            ],
            [
                'brand' => 'Peugeot',
                'model' => '208',
                'year' => 2023,
                'mileage' => 8000,
                'daily_price' => 140.00,
                'license_plate' => '234TU5678',
                'color' => 'Noir',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'agency_id' => $agency->id,
            ],
            [
                'brand' => 'Volkswagen',
                'model' => 'Golf',
                'year' => 2021,
                'mileage' => 22000,
                'daily_price' => 180.00,
                'license_plate' => '345TU6789',
                'color' => 'Gris',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'hybrid',
                'status' => 'available',
                'agency_id' => $agency->id,
            ],
        ];
        foreach ($vehicles as $data) {
            Vehicle::create($data);
        }
    }
}
