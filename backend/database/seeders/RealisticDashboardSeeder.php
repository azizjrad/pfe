<?php

namespace Database\Seeders;

use App\Models\ClientReliabilityScore;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleReturn;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RealisticDashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = fake('fr_FR');

        $vehicles = Vehicle::all();
        if ($vehicles->isEmpty()) {
            $this->command?->warn('No vehicles found. Skipping realistic dashboard seeding.');
            return;
        }

        $this->seedAdditionalClients($faker);
        $clients = User::where('role', 'client')->get();

        if ($clients->isEmpty()) {
            $this->command?->warn('No clients found. Skipping realistic dashboard seeding.');
            return;
        }

        $existingGeneratedReservations = Reservation::where('notes', 'like', '[seed-demo]%')->count();
        $targetGeneratedReservations = 140;
        $toGenerate = max(0, $targetGeneratedReservations - $existingGeneratedReservations);

        if ($toGenerate === 0) {
            $this->command?->info('Realistic demo reservations already seeded. Refreshing reliability scores only.');
            $this->refreshReliabilityScores();
            return;
        }

        for ($i = 0; $i < $toGenerate; $i++) {
            $vehicle = $vehicles->random();
            $client = $clients->random();

            $bookingDate = Carbon::now()->subDays(rand(5, 300))->setTime(rand(8, 21), rand(0, 59));
            $startDate = (clone $bookingDate)->addDays(rand(2, 40));
            $duration = rand(2, 12);
            $endDate = (clone $startDate)->addDays($duration - 1);

            $status = $this->resolveStatus($startDate, $endDate);
            if ($status === 'cancelled') {
                $paymentStatus = 'unpaid';
            } else {
                $paymentStatus = $this->resolvePaymentStatus($status);
            }

            $basePrice = round((float) $vehicle->daily_price * $duration, 2);
            $discountAmount = rand(0, 100) <= 30 ? round($basePrice * (rand(5, 15) / 100), 2) : 0.0;
            $additionalCharges = 0.0;

            $isLateReturn = false;
            $actualReturnDate = null;

            if ($status === 'completed' && rand(0, 100) <= 20) {
                $isLateReturn = true;
                $lateDays = rand(1, 3);
                $additionalCharges = round((float) $vehicle->daily_price * $lateDays, 2);
                $actualReturnDate = (clone $endDate)->addDays($lateDays)->format('Y-m-d');
            }

            $totalPrice = max(0.0, round($basePrice - $discountAmount + $additionalCharges, 2));
            $commissionRate = 0.15;
            $platformCommission = round($totalPrice * $commissionRate, 2);
            $agencyPayout = round($totalPrice - $platformCommission, 2);

            [$paidAmount, $remainingAmount] = $this->resolveAmounts($totalPrice, $paymentStatus);

            $reservation = new Reservation([
                'user_id' => $client->id,
                'vehicle_id' => $vehicle->id,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'pickup_location' => 'Agence ' . $vehicle->agency->city,
                'dropoff_location' => 'Agence ' . $vehicle->agency->city,
                'base_price' => $basePrice,
                'discount_amount' => $discountAmount,
                'additional_charges' => $additionalCharges,
                'total_price' => $totalPrice,
                'platform_commission_rate' => $commissionRate,
                'platform_commission' => $platformCommission,
                'agency_payout' => $agencyPayout,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
                'payment_status' => $paymentStatus,
                'payment_method' => collect(['credit_card', 'debit_card', 'cash', 'bank_transfer'])->random(),
                'status' => $status,
                'actual_return_date' => $actualReturnDate,
                'is_late_return' => $isLateReturn,
                'notes' => '[seed-demo] Generated realistic reservation for dashboard testing',
                'pricing_details' => [
                    'duration_days' => $duration,
                    'daily_price' => (float) $vehicle->daily_price,
                    'discount_rate' => $basePrice > 0 ? round(($discountAmount / $basePrice) * 100, 2) : 0,
                ],
            ]);

            $reservation->created_at = $bookingDate;
            $reservation->updated_at = (clone $bookingDate)->addHours(rand(1, 72));
            $reservation->save();

            $this->createPaymentsForReservation($reservation, $paymentStatus, $paidAmount, $remainingAmount);
            $this->createReturnIfNeeded($reservation, $status, $faker);
        }

        $this->refreshReliabilityScores();

        $this->command?->info("Realistic dashboard data seeded: {$toGenerate} reservations + related payments/returns.");
    }

    private function seedAdditionalClients($faker): void
    {
        $targetClients = 25;

        for ($i = 1; $i <= $targetClients; $i++) {
            User::firstOrCreate(
                ['email' => "client.demo{$i}@elitedrive.com"],
                [
                    'name' => $faker->name(),
                    'password' => Hash::make('password'),
                    'role' => 'client',
                    'agency_id' => null,
                    'phone' => '+216 ' . rand(20, 99) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                    'address' => $faker->address(),
                    'driver_license' => 'TN-DEMO-' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                    'email_verified_at' => now(),
                ]
            );
        }
    }

    private function resolveStatus(Carbon $startDate, Carbon $endDate): string
    {
        $now = Carbon::now();

        if ($endDate->lt($now)) {
            $roll = rand(1, 100);
            if ($roll <= 78) {
                return 'completed';
            }
            if ($roll <= 92) {
                return 'cancelled';
            }
            return 'confirmed';
        }

        if ($startDate->lte($now) && $endDate->gte($now)) {
            return rand(1, 100) <= 75 ? 'ongoing' : 'confirmed';
        }

        return rand(1, 100) <= 60 ? 'confirmed' : 'pending';
    }

    private function resolvePaymentStatus(string $status): string
    {
        if ($status === 'completed') {
            $roll = rand(1, 100);
            if ($roll <= 72) {
                return 'paid';
            }
            if ($roll <= 90) {
                return 'partially_paid';
            }
            return 'overdue';
        }

        if ($status === 'ongoing' || $status === 'confirmed') {
            return rand(1, 100) <= 75 ? 'partially_paid' : 'unpaid';
        }

        return 'unpaid';
    }

    private function resolveAmounts(float $totalPrice, string $paymentStatus): array
    {
        if ($paymentStatus === 'paid') {
            return [$totalPrice, 0.0];
        }

        if ($paymentStatus === 'partially_paid') {
            $paid = round($totalPrice * (rand(20, 60) / 100), 2);
            return [$paid, round(max(0, $totalPrice - $paid), 2)];
        }

        if ($paymentStatus === 'overdue') {
            $paid = round($totalPrice * (rand(10, 40) / 100), 2);
            return [$paid, round(max(0, $totalPrice - $paid), 2)];
        }

        return [0.0, $totalPrice];
    }

    private function createPaymentsForReservation(
        Reservation $reservation,
        string $paymentStatus,
        float $paidAmount,
        float $remainingAmount
    ): void {
        $createdAt = Carbon::parse($reservation->created_at);

        if ($paidAmount > 0) {
            Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => $paidAmount,
                'payment_date' => (clone $createdAt)->addHours(rand(1, 36)),
                'payment_type' => $paidAmount >= (float) $reservation->total_price ? 'full' : 'deposit',
                'status' => 'completed',
                'transaction_reference' => 'TXN-' . strtoupper(substr(md5($reservation->id . '-paid'), 0, 10)),
                'due_date' => null,
                'is_late' => false,
                'notes' => 'Initial payment from realistic seeder',
            ]);
        }

        if ($paymentStatus === 'partially_paid' || $paymentStatus === 'overdue' || $remainingAmount > 0) {
            Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => max(0.0, $remainingAmount),
                'payment_date' => (clone $createdAt)->addDays(2),
                'payment_type' => 'balance',
                'status' => $paymentStatus === 'overdue' ? 'overdue' : 'pending',
                'transaction_reference' => null,
                'due_date' => (clone $createdAt)->addDays(7)->format('Y-m-d'),
                'is_late' => $paymentStatus === 'overdue',
                'notes' => 'Balance generated by realistic seeder',
            ]);
        }
    }

    private function createReturnIfNeeded(Reservation $reservation, string $status, $faker): void
    {
        if ($status !== 'completed' || rand(1, 100) > 70) {
            return;
        }

        $vehicleCondition = rand(1, 100) <= 15
            ? collect(['fair', 'damaged'])->random()
            : collect(['excellent', 'good'])->random();

        VehicleReturn::create([
            'reservation_id' => $reservation->id,
            'return_date' => Carbon::parse($reservation->actual_return_date ?? $reservation->end_date)
                ->setTime(rand(8, 20), rand(0, 59)),
            'return_mileage' => rand(15000, 120000),
            'fuel_level' => collect(['quarter', 'half', 'three_quarters', 'full'])->random(),
            'vehicle_condition' => $vehicleCondition,
            'damage_description' => in_array($vehicleCondition, ['fair', 'damaged'], true)
                ? $faker->sentence()
                : null,
            'additional_charges' => (float) $reservation->additional_charges,
            'notes' => '[seed-demo] Return inspection generated',
        ]);
    }

    private function refreshReliabilityScores(): void
    {
        $clients = User::where('role', 'client')->get();

        foreach ($clients as $client) {
            $reservations = Reservation::where('user_id', $client->id);

            $totalReservations = (clone $reservations)->count();
            $completedReservations = (clone $reservations)->where('status', 'completed')->count();
            $cancelledReservations = (clone $reservations)->where('status', 'cancelled')->count();
            $lateReturns = (clone $reservations)->where('is_late_return', true)->count();
            $paymentDelays = (clone $reservations)->where('payment_status', 'overdue')->count();
            $damageIncidents = VehicleReturn::whereHas('reservation', function ($query) use ($client) {
                $query->where('user_id', $client->id);
            })->where('vehicle_condition', 'damaged')->count();

            $score = 100
                - ($cancelledReservations * 8)
                - ($lateReturns * 12)
                - ($paymentDelays * 15)
                - ($damageIncidents * 18);

            $score = max(0, min(100, $score));

            $riskLevel = 'low';
            if ($score < 25) {
                $riskLevel = 'blocked';
            } elseif ($score < 45) {
                $riskLevel = 'high';
            } elseif ($score < 70) {
                $riskLevel = 'medium';
            }

            ClientReliabilityScore::updateOrCreate(
                ['user_id' => $client->id],
                [
                    'total_reservations' => $totalReservations,
                    'completed_reservations' => $completedReservations,
                    'cancelled_reservations' => $cancelledReservations,
                    'late_returns' => $lateReturns,
                    'payment_delays' => $paymentDelays,
                    'damage_incidents' => $damageIncidents,
                    'reliability_score' => $score,
                    'risk_level' => $riskLevel,
                    'admin_notes' => '[seed-demo] Auto-calculated from seeded reservations',
                    'last_calculated_at' => now(),
                ]
            );
        }
    }
}
