<?php

namespace Database\Seeders;

use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReservationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reservations = [
            // Réservation complétée - Sami Jrad (client 1)
            [
                'user_id' => 4, // Sami Jrad
                'vehicle_id' => 1, // Renault Clio
                'start_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'end_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'pickup_location' => 'Agence Tunis Centre',
                'dropoff_location' => 'Agence Tunis Centre',
                'base_price' => 400.00, // 5 jours * 80 DT
                'discount_amount' => 0.00,
                'additional_charges' => 0.00,
                'total_price' => 400.00,
                'paid_amount' => 400.00,
                'remaining_amount' => 0.00,
                'status' => 'completed',
                'payment_status' => 'paid',
            ],

            // Réservation en cours - Amira Gharbi (client 2)
            [
                'user_id' => 5, // Amira Gharbi
                'vehicle_id' => 6, // Kia Sportage (actuellement louée)
                'start_date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'end_date' => Carbon::now()->addDays(4)->format('Y-m-d'),
                'pickup_location' => 'Agence Aéroport Carthage',
                'dropoff_location' => 'Agence Aéroport Carthage',
                'base_price' => 1120.00, // 7 jours * 160 DT
                'discount_amount' => 112.00, // 10% réduction long terme
                'additional_charges' => 0.00,
                'total_price' => 1008.00,
                'paid_amount' => 320.00, // Acompte de 320 DT
                'remaining_amount' => 688.00,
                'status' => 'ongoing',
                'payment_status' => 'partially_paid',
            ],

            // Réservation confirmée - Karim Bouazizi (client 3)
            [
                'user_id' => 6, // Karim Bouazizi
                'vehicle_id' => 7, // Mercedes Classe C
                'start_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'end_date' => Carbon::now()->addDays(8)->format('Y-m-d'),
                'pickup_location' => 'Agence Aéroport Carthage',
                'dropoff_location' => 'Agence Aéroport Carthage',
                'base_price' => 900.00, // 3 jours * 300 DT
                'discount_amount' => 0.00,
                'additional_charges' => 135.00, // Supplément aéroport 15%
                'total_price' => 1035.00,
                'paid_amount' => 310.50, // Acompte de 30%
                'remaining_amount' => 724.50,
                'status' => 'confirmed',
                'payment_status' => 'partially_paid',
            ],

            // Réservation complétée avec retard - Sami Jrad
            [
                'user_id' => 4, // Sami Jrad
                'vehicle_id' => 3, // Toyota Corolla
                'start_date' => Carbon::now()->subDays(35)->format('Y-m-d'),
                'end_date' => Carbon::now()->subDays(32)->format('Y-m-d'),
                'pickup_location' => 'Agence Tunis Centre',
                'dropoff_location' => 'Agence Tunis Centre',
                'base_price' => 360.00, // 3 jours * 120 DT
                'discount_amount' => 0.00,
                'additional_charges' => 240.00, // Retard de 2 jours
                'total_price' => 600.00,
                'paid_amount' => 600.00,
                'remaining_amount' => 0.00,
                'status' => 'completed',
                'payment_status' => 'paid',
            ],

            // Réservation annulée - Karim Bouazizi
            [
                'user_id' => 6, // Karim Bouazizi
                'vehicle_id' => 2, // Peugeot 208
                'start_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
                'end_date' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'pickup_location' => 'Agence Tunis Centre',
                'dropoff_location' => 'Agence Tunis Centre',
                'base_price' => 255.00, // 3 jours * 85 DT
                'discount_amount' => 0.00,
                'additional_charges' => 0.00,
                'total_price' => 255.00,
                'paid_amount' => 0.00,
                'remaining_amount' => 0.00,
                'status' => 'cancelled',
                'payment_status' => 'unpaid',
            ],

            // Réservation en attente - Amira Gharbi
            [
                'user_id' => 5, // Amira Gharbi
                'vehicle_id' => 10, // Nissan Qashqai
                'start_date' => Carbon::now()->addDays(15)->format('Y-m-d'),
                'end_date' => Carbon::now()->addDays(20)->format('Y-m-d'),
                'pickup_location' => 'Agence Sfax',
                'dropoff_location' => 'Agence Sfax',
                'base_price' => 725.00, // 5 jours * 145 DT
                'discount_amount' => 0.00,
                'additional_charges' => 0.00,
                'total_price' => 725.00,
                'paid_amount' => 0.00,
                'remaining_amount' => 725.00,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ],

            // Réservation complétée impayée - Karim Bouazizi (client à risque)
            [
                'user_id' => 6, // Karim Bouazizi
                'vehicle_id' => 8, // Dacia Logan
                'start_date' => Carbon::now()->subDays(50)->format('Y-m-d'),
                'end_date' => Carbon::now()->subDays(46)->format('Y-m-d'),
                'pickup_location' => 'Agence Sousse',
                'dropoff_location' => 'Agence Sousse',
                'base_price' => 280.00, // 4 jours * 70 DT
                'discount_amount' => 0.00,
                'additional_charges' => 0.00,
                'total_price' => 280.00,
                'paid_amount' => 0.00,
                'remaining_amount' => 280.00,
                'status' => 'completed',
                'payment_status' => 'unpaid',
            ],
        ];

        foreach ($reservations as $reservation) {
            Reservation::create($reservation);
        }
    }
}
