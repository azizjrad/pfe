<?php

namespace Database\Seeders;

use App\Models\VehicleReturn;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VehicleReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $returns = [
            // Retour sans problème - Réservation 1 (Sami)
            [
                'reservation_id' => 1,
                'return_date' => Carbon::now()->subDays(15)->format('Y-m-d H:i:s'),
                'return_mileage' => 15450, // +450 km
                'fuel_level' => 'full',
                'vehicle_condition' => 'excellent',
                'damage_description' => null,
                'additional_charges' => 0.00,
                'notes' => 'Véhicule retourné en parfait état',
            ],

            // Retour avec retard - Réservation 4 (Sami)
            [
                'reservation_id' => 4,
                'return_date' => Carbon::now()->subDays(30)->format('Y-m-d H:i:s'),
                'return_mileage' => 5600, // +600 km
                'fuel_level' => 'three_quarters',
                'vehicle_condition' => 'good',
                'damage_description' => null,
                'additional_charges' => 240.00, // 2 jours de retard * 120 DT
                'notes' => 'Véhicule retourné avec 2 jours de retard',
            ],

            // Retour avec dommages - Réservation 7 (Karim)
            [
                'reservation_id' => 7,
                'return_date' => Carbon::now()->subDays(46)->format('Y-m-d H:i:s'),
                'return_mileage' => 60850, // +850 km
                'fuel_level' => 'half',
                'vehicle_condition' => 'damaged',
                'damage_description' => 'Rayure profonde sur la portière avant droite, rétroviseur légèrement endommagé',
                'additional_charges' => 450.00, // Frais de réparation
                'notes' => 'Dommages constatés lors du retour - Devis réparation fourni',
            ],
        ];

        foreach ($returns as $return) {
            VehicleReturn::create($return);
        }
    }
}
