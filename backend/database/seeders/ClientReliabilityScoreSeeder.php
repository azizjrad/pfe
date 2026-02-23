<?php

namespace Database\Seeders;

use App\Models\ClientReliabilityScore;
use Illuminate\Database\Seeder;

class ClientReliabilityScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $scores = [
            // Sami Jrad - Client fiable (score élevé)
            [
                'user_id' => 4,
                'total_reservations' => 2,
                'cancelled_reservations' => 0,
                'late_returns' => 1,
                'payment_delays' => 0,
                'damage_incidents' => 0,
                'total_unpaid_amount' => 0.00,
                'reliability_score' => 90, // Pénalité: 0*5 + 1*10 + 0*15 + 0*20 + 0*30 = 10
                'risk_level' => 'low',
            ],

            // Amira Gharbi - Nouveau client (score moyen)
            [
                'user_id' => 5,
                'total_reservations' => 2,
                'cancelled_reservations' => 0,
                'late_returns' => 0,
                'payment_delays' => 0,
                'damage_incidents' => 0,
                'total_unpaid_amount' => 0.00,
                'reliability_score' => 100, // Client parfait jusqu'à présent
                'risk_level' => 'low',
            ],

            // Karim Bouazizi - Client à risque (score bas)
            [
                'user_id' => 6,
                'total_reservations' => 3,
                'cancelled_reservations' => 1,
                'late_returns' => 0,
                'payment_delays' => 1,
                'damage_incidents' => 1,
                'total_unpaid_amount' => 730.00, // 280 (réservation 7) + 450 (dommages)
                'reliability_score' => 38, // Pénalité: 1*5 + 0*10 + 1*15 + 1*20 + 730*30/1000 = 62
                'risk_level' => 'high',
            ],
        ];

        foreach ($scores as $score) {
            ClientReliabilityScore::create($score);
        }
    }
}
