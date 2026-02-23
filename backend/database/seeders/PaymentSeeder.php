<?php

namespace Database\Seeders;

use App\Models\Payment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $payments = [
            // Paiement complet - Réservation 1 (Sami)
            [
                'reservation_id' => 1,
                'amount' => 400.00,
                'payment_type' => 'full',
                'payment_date' => Carbon::now()->subDays(20)->format('Y-m-d H:i:s'),
                'status' => 'completed',
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Paiement à la prise du véhicule',
            ],

            // Acompte - Réservation 2 (Amira)
            [
                'reservation_id' => 2,
                'amount' => 320.00,
                'payment_type' => 'deposit',
                'payment_date' => Carbon::now()->subDays(3)->format('Y-m-d H:i:s'),
                'status' => 'completed',
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Acompte reçu',
            ],

            // Acompte - Réservation 3 (Karim)
            [
                'reservation_id' => 3,
                'amount' => 310.50,
                'payment_type' => 'deposit',
                'payment_date' => Carbon::now()->format('Y-m-d H:i:s'),
                'status' => 'completed',
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Acompte de 30% reçu',
            ],

            // Paiement complet avec retard - Réservation 4 (Sami)
            [
                'reservation_id' => 4,
                'amount' => 360.00,
                'payment_type' => 'partial',
                'payment_date' => Carbon::now()->subDays(32)->format('Y-m-d H:i:s'),
                'status' => 'completed',
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Paiement du montant initial',
            ],
            [
                'reservation_id' => 4,
                'amount' => 240.00,
                'payment_type' => 'balance',
                'payment_date' => Carbon::now()->subDays(28)->format('Y-m-d H:i:s'),
                'status' => 'completed',
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Paiement des frais de retard',
            ],

            // Paiement à tempérament en retard - Réservation 6 (Amira)
            [
                'reservation_id' => 6,
                'amount' => 0.00,
                'payment_type' => 'partial',
                'payment_date' => Carbon::now()->format('Y-m-d H:i:s'),
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(15)->format('Y-m-d'),
                'is_late' => false,
                'notes' => 'Premier versement à échéance dans 15 jours',
            ],

            // Paiement impayé - Réservation 7 (Karim - client à risque)
            // Aucun paiement enregistré pour cette réservation
        ];

        foreach ($payments as $payment) {
            Payment::create($payment);
        }
    }
}
