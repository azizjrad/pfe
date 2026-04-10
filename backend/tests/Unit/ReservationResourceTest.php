<?php

namespace Tests\Unit;

use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tests\TestCase;

class ReservationResourceTest extends TestCase
{
    public function test_it_exposes_contract_fields_in_api_payload(): void
    {
        $reservation = new Reservation();
        $reservation->forceFill([
            'id' => 15,
            'user_id' => 4,
            'vehicle_id' => 9,
            'start_date' => Carbon::parse('2026-04-10'),
            'end_date' => Carbon::parse('2026-04-14'),
            'pickup_location' => 'Agence Tunis Centre',
            'dropoff_location' => 'Agence Tunis Centre',
            'client_birth_date' => Carbon::parse('1992-05-18'),
            'driver_first_name' => 'Ali',
            'driver_last_name' => 'Ben Salah',
            'driver_birth_date' => Carbon::parse('1992-05-18'),
            'driver_license_number' => 'TN-123456',
            'driver_license_date' => Carbon::parse('2015-06-01'),
            'base_price' => 500,
            'discount_amount' => 0,
            'additional_charges' => 25,
            'total_price' => 525,
            'paid_amount' => 0,
            'remaining_amount' => 525,
            'payment_status' => 'unpaid',
            'platform_commission' => 26.25,
            'notes' => 'Test reservation',
            'status' => 'pending',
        ]);

        $reservation->setRelation('user', new User([
            'id' => 4,
            'name' => 'Client Test',
            'email' => 'client@example.com',
            'phone' => '12345678',
            'role' => 'client',
        ]));

        $reservation->setRelation('vehicle', new Vehicle([
            'id' => 9,
            'name' => 'Peugeot 208',
            'brand' => 'Peugeot',
            'model' => '208',
            'daily_price' => 100,
            'caution_amount' => 300,
            'license_plate' => '123 TUN 456',
            'seats' => 5,
            'status' => 'available',
            'year' => 2025,
        ]));

        $reservation->setRelation('payments', collect());

        $data = (new ReservationResource($reservation))->toArray(Request::create('/'));

        $this->assertSame('1992-05-18', $data['client_birth_date']);
        $this->assertSame(300.0, $data['deposit_amount']);
        $this->assertSame('Ali', $data['driver_first_name']);
        $this->assertSame('Ben Salah', $data['driver_last_name']);
        $this->assertSame('1992-05-18', $data['driver_birth_date']);
        $this->assertSame('TN-123456', $data['driver_license_number']);
        $this->assertSame('2015-06-01', $data['driver_license_date']);
        $this->assertSame('Agence Tunis Centre', $data['pickup_location']);
        $this->assertSame(525.0, $data['total_price']);
    }
}
