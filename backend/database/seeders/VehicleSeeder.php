<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vehicles = [
            // Agence Tunis Centre - Économique
            [
                'brand' => 'Renault',
                'model' => 'Clio',
                'year' => 2023,
                'mileage' => 15000,
                'daily_price' => 80,
                'license_plate' => 'TUN-123-456',
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'image' => null,
                'agency_id' => 1,
                'category_id' => 1, // Économique
            ],
            [
                'brand' => 'Peugeot',
                'model' => '208',
                'year' => 2023,
                'mileage' => 12000,
                'daily_price' => 85,
                'license_plate' => 'TUN-234-567',
                'color' => 'Rouge',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'image' => null,
                'agency_id' => 1,
                'category_id' => 1,
            ],

            // Agence Tunis Centre - Berline
            [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2024,
                'mileage' => 5000,
                'daily_price' => 120,
                'license_plate' => 'TUN-345-678',
                'color' => 'Gris',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'hybrid',
                'status' => 'available',
                'image' => null,
                'agency_id' => 1,
                'category_id' => 2, // Berline
            ],

            // Agence Tunis Centre - SUV
            [
                'brand' => 'Hyundai',
                'model' => 'Tucson',
                'year' => 2023,
                'mileage' => 25000,
                'daily_price' => 150,
                'license_plate' => 'TUN-456-789',
                'color' => 'Noir',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'image' => null,
                'agency_id' => 1,
                'category_id' => 3, // SUV
            ],

            // Agence Aéroport - SUV Premium
            [
                'brand' => 'Toyota',
                'model' => 'RAV4',
                'year' => 2024,
                'mileage' => 8000,
                'daily_price' => 180,
                'license_plate' => 'TUN-567-890',
                'color' => 'Blanc Perlé',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'hybrid',
                'status' => 'available',
                'image' => null,
                'agency_id' => 2,
                'category_id' => 3,
            ],
            [
                'brand' => 'Kia',
                'model' => 'Sportage',
                'year' => 2023,
                'mileage' => 18000,
                'daily_price' => 160,
                'license_plate' => 'TUN-678-901',
                'color' => 'Bleu',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'rented',
                'image' => null,
                'agency_id' => 2,
                'category_id' => 3,
            ],

            // Agence Aéroport - Luxe
            [
                'brand' => 'Mercedes',
                'model' => 'Classe C',
                'year' => 2024,
                'mileage' => 3000,
                'daily_price' => 300,
                'license_plate' => 'TUN-789-012',
                'color' => 'Noir Métallisé',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'image' => null,
                'agency_id' => 2,
                'category_id' => 4, // Luxe
            ],

            // Agence Sousse - Économique
            [
                'brand' => 'Dacia',
                'model' => 'Logan',
                'year' => 2022,
                'mileage' => 45000,
                'daily_price' => 70,
                'license_plate' => 'SUS-123-456',
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'image' => null,
                'agency_id' => 3,
                'category_id' => 1,
            ],

            // Agence Sousse - Berline
            [
                'brand' => 'Volkswagen',
                'model' => 'Passat',
                'year' => 2023,
                'mileage' => 22000,
                'daily_price' => 140,
                'license_plate' => 'SUS-234-567',
                'color' => 'Argent',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'image' => null,
                'agency_id' => 3,
                'category_id' => 2,
            ],

            // Agence Sfax - SUV
            [
                'brand' => 'Nissan',
                'model' => 'Qashqai',
                'year' => 2023,
                'mileage' => 19000,
                'daily_price' => 145,
                'license_plate' => 'SFX-123-456',
                'color' => 'Rouge',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'image' => null,
                'agency_id' => 4,
                'category_id' => 3,
            ],

            // Agence Hammamet - Luxe
            [
                'brand' => 'BMW',
                'model' => 'Série 3',
                'year' => 2024,
                'mileage' => 5000,
                'daily_price' => 320,
                'license_plate' => 'HAM-123-456',
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'maintenance',
                'image' => null,
                'agency_id' => 5,
                'category_id' => 4,
            ],

            // Agence Hammamet - Utilitaire
            [
                'brand' => 'Renault',
                'model' => 'Kangoo',
                'year' => 2022,
                'mileage' => 60000,
                'daily_price' => 100,
                'license_plate' => 'HAM-234-567',
                'color' => 'Blanc',
                'seats' => 2,
                'transmission' => 'manual',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'image' => null,
                'agency_id' => 5,
                'category_id' => 5, // Utilitaire
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }
    }
}
