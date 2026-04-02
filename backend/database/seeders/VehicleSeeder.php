<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Category;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agencyIds = Agency::query()
            ->pluck('id', 'email')
            ->toArray();

        $categoryIds = Category::query()
            ->pluck('id', 'name')
            ->toArray();

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
                'images' => null,
                'agency_email' => 'tunis.centre@location.tn',
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
                'images' => null,
                'agency_email' => 'tunis.centre@location.tn',
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
                'images' => null,
                'agency_email' => 'tunis.centre@location.tn',
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
                'images' => null,
                'agency_email' => 'tunis.centre@location.tn',
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
                'images' => null,
                'agency_email' => 'aeroport@location.tn',
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
                'images' => null,
                'agency_email' => 'aeroport@location.tn',
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
                'images' => null,
                'agency_email' => 'aeroport@location.tn',
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
                'images' => null,
                'agency_email' => 'sousse@location.tn',
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
                'images' => null,
                'agency_email' => 'sousse@location.tn',
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
                'images' => null,
                'agency_email' => 'sfax@location.tn',
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
                'images' => null,
                'agency_email' => 'hammamet@location.tn',
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
                'images' => null,
                'agency_email' => 'hammamet@location.tn',
            ],

            // Agence Nabeul
            [
                'brand' => 'Seat',
                'model' => 'Arona',
                'year' => 2023,
                'mileage' => 24000,
                'daily_price' => 135,
                'license_plate' => 'NAB-123-111',
                'color' => 'Bleu Foncé',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'nabeul@location.tn',
            ],
            [
                'brand' => 'Skoda',
                'model' => 'Octavia',
                'year' => 2022,
                'mileage' => 41000,
                'daily_price' => 125,
                'license_plate' => 'NAB-123-222',
                'color' => 'Gris',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'nabeul@location.tn',
            ],

            // Agence Monastir Aéroport
            [
                'brand' => 'Audi',
                'model' => 'A4',
                'year' => 2024,
                'mileage' => 9000,
                'daily_price' => 260,
                'license_plate' => 'MON-555-101',
                'color' => 'Noir',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'diesel',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'monastir.airport@location.tn',
            ],
            [
                'brand' => 'Fiat',
                'model' => 'Tipo',
                'year' => 2023,
                'mileage' => 26000,
                'daily_price' => 95,
                'license_plate' => 'MON-555-202',
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'monastir.airport@location.tn',
            ],

            // Agence Djerba Midoun
            [
                'brand' => 'Ford',
                'model' => 'Kuga',
                'year' => 2024,
                'mileage' => 11000,
                'daily_price' => 190,
                'license_plate' => 'DJE-777-303',
                'color' => 'Argent',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'hybrid',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'djerba@location.tn',
            ],
            [
                'brand' => 'Citroen',
                'model' => 'C3',
                'year' => 2022,
                'mileage' => 38000,
                'daily_price' => 88,
                'license_plate' => 'DJE-777-404',
                'color' => 'Rouge',
                'seats' => 5,
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'status' => 'available',
                'images' => null,
                'agency_email' => 'djerba@location.tn',
            ],
        ];

        $categoryByModel = [
            'Clio' => 'Économique',
            '208' => 'Économique',
            'Corolla' => 'Berline',
            'Tucson' => 'SUV',
            'RAV4' => 'SUV',
            'Sportage' => 'SUV',
            'Classe C' => 'Luxe',
            'Logan' => 'Économique',
            'Passat' => 'Berline',
            'Qashqai' => 'SUV',
            'Série 3' => 'Luxe',
            'Kangoo' => 'Utilitaire',
            'Arona' => 'SUV',
            'Octavia' => 'Berline',
            'A4' => 'Luxe',
            'Tipo' => 'Économique',
            'Kuga' => 'SUV',
            'C3' => 'Économique',
        ];

        foreach ($vehicles as $vehicle) {
            $agencyEmail = $vehicle['agency_email'];
            $agencyId = $agencyIds[$agencyEmail] ?? null;
            $categoryName = $categoryByModel[$vehicle['model']] ?? 'Économique';
            $categoryId = $categoryIds[$categoryName] ?? null;

            if (!$agencyId || !$categoryId) {
                continue;
            }

            unset($vehicle['agency_email']);
            $vehicle['agency_id'] = $agencyId;
            $vehicle['category_id'] = $categoryId;

            Vehicle::updateOrCreate(
                ['license_plate' => $vehicle['license_plate']],
                $vehicle
            );
        }
    }
}
