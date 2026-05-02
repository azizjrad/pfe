<?php

namespace Database\Seeders;

use App\Domain\Enums\ReservationPaymentStatus;
use App\Domain\Enums\ReservationStatus;
use App\Domain\Enums\VehicleStatus;
use App\Models\Agency;
use App\Models\ClientReliabilityScore;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ContractFlowDemoSeeder extends Seeder
{
    /**
     * Seed a complete demo scenario for:
     * - super admin login
     * - agency admin approval flow
     * - client pending reservation
     * - contract generation fields
     */
    public function run(): void
    {
        // Ensure platform super admin exists with known credentials.
        $this->call(SuperAdminSeeder::class);

        $agency = Agency::updateOrCreate(
            ['email' => 'test.agency@elitedrive.com'],
            [
                'name' => 'Elite Drive Test Agency',
                'address' => 'Avenue Habib Bourguiba',
                'city' => 'Tunis',
                'phone' => '71101010',
                'opening_time' => '08:00',
                'closing_time' => '18:00',
                'status' => 'active',
            ]
        );

        $agencyAdmin = User::updateOrCreate(
            ['email' => 'agency.admin@elitedrive.com'],
            [
                'name' => 'Agency Admin Demo',
                'password' => Hash::make('Agency2026!'),
                'role' => 'agency_admin',
                'agency_id' => $agency->id,
                'phone' => '20101010',
                'address' => 'Tunis',
                'driver_license' => null,
                'must_change_password' => false,
                'email_verified_at' => now(),
                'is_suspended' => false,
                'suspension_reason' => null,
                'suspended_at' => null,
            ]
        );

        $client = User::updateOrCreate(
            ['email' => 'client.test@elitedrive.com'],
            [
                'name' => 'Client Test Demo',
                'password' => Hash::make('Client2026!'),
                'role' => 'client',
                'agency_id' => null,
                'phone' => '22101010',
                'address' => 'Sousse',
                'driver_license' => 'TN-CLT-2026-001',
                'must_change_password' => false,
                'email_verified_at' => now(),
                'is_suspended' => false,
                'suspension_reason' => null,
                'suspended_at' => null,
            ]
        );

        ClientReliabilityScore::updateOrCreate(
            ['user_id' => $client->id],
            [
                'total_reservations' => 0,
                'completed_reservations' => 0,
                'cancelled_reservations' => 0,
                'late_returns' => 0,
                'payment_delays' => 0,
                'damage_incidents' => 0,
                'reliability_score' => 100,
                'risk_level' => 'low',
                'last_calculated_at' => now(),
                'total_unpaid_amount' => 0,
            ]
        );

        $vehicle = Vehicle::updateOrCreate(
            ['license_plate' => '777TU2026'],
            [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2024,
                'mileage' => 12000,
                'daily_price' => 175.00,
                'caution_amount' => 1200.00,
                'color' => 'Blanc',
                'seats' => 5,
                'transmission' => 'automatic',
                'fuel_type' => 'hybrid',
                'status' => VehicleStatus::AVAILABLE->value,
                'agency_id' => $agency->id,
            ]
        );

        $startDate = Carbon::now()->addDays(2)->toDateString();
        $endDate = Carbon::now()->addDays(5)->toDateString();
        $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
        $basePrice = round($days * (float) $vehicle->daily_price, 2);
        $commissionRate = 0.08;
        $platformCommission = round($basePrice * $commissionRate, 2);
        $agencyPayout = round($basePrice - $platformCommission, 2);

        $reservation = Reservation::updateOrCreate(
            [
                'user_id' => $client->id,
                'vehicle_id' => $vehicle->id,
                'status' => ReservationStatus::PENDING->value,
            ],
            [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'pickup_location' => 'Agence Elite Drive Tunis Centre',
                'dropoff_location' => 'Agence Elite Drive Tunis Centre',
                'base_price' => $basePrice,
                'discount_amount' => 0,
                'additional_charges' => 0,
                'total_price' => $basePrice,
                'platform_commission_rate' => $commissionRate,
                'platform_commission' => $platformCommission,
                'agency_payout' => $agencyPayout,
                'paid_amount' => 0,
                'remaining_amount' => $basePrice,
                'payment_status' => ReservationPaymentStatus::UNPAID->value,
                'notes' => 'Reservation de test pour validation agence et generation contrat.',
                'client_birth_date' => '1998-05-14',
                'driver_first_name' => 'Client',
                'driver_last_name' => 'Demo',
                'driver_birth_date' => '1998-05-14',
                'driver_license_number' => 'TN-CLT-2026-001',
                'driver_license_date' => '2018-06-01',
                'pricing_details' => [
                    'days' => $days,
                    'daily_price' => (float) $vehicle->daily_price,
                    'caution_amount' => (float) ($vehicle->caution_amount ?? 0),
                    'commission_rate' => $commissionRate,
                ],
            ]
        );

        $this->command?->info('✅ Contract flow demo data seeded successfully.');
        $this->command?->line('');
        $this->command?->line('Super Admin: admin@elitedrive.com / Admin2024!');
        $this->command?->line('Agency Admin: agency.admin@elitedrive.com / Agency2026!');
        $this->command?->line('Client: client.test@elitedrive.com / Client2026!');
        $this->command?->line('Agency: Elite Drive Test Agency');
        $this->command?->line('Vehicle: Toyota Corolla (777TU2026)');
        $this->command?->line('Pending reservation ID: ' . $reservation->id);
    }
}
