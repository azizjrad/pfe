<?php

namespace Tests\Unit;

use App\Http\Requests\StoreReservationRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreReservationRequestTest extends TestCase
{
    public function test_new_contract_fields_are_accepted_by_store_validation(): void
    {
        $request = new StoreReservationRequest();
        $rules = $request->rules();

        $payload = [
            'vehicle_id' => 1,
            'start_date' => '2026-04-10',
            'end_date' => '2026-04-14',
            'pickup_location' => 'Agence Tunis Centre',
            'dropoff_location' => 'Agence Tunis Centre',
            'full_name' => 'Client Test',
            'email' => 'client@example.com',
            'phone' => '12345678',
            'client_birth_date' => '1992-05-18',
            'driver_first_name' => 'Ali',
            'driver_last_name' => 'Ben Salah',
            'driver_birth_date' => '1992-05-18',
            'driver_license_number' => 'TN-123456',
            'driver_license_date' => '2015-06-01',
            'options' => [
                'airport_delivery' => false,
                'home_delivery' => false,
                'after_hours_pickup' => false,
            ],
            'pricing_breakdown' => [
                'total' => 525,
            ],
        ];

        $validator = Validator::make($payload, $rules);

        $this->assertTrue($validator->passes(), json_encode($validator->errors()->all()));
    }

    public function test_additional_charges_are_validated_for_return_flow(): void
    {
        $rules = (new \App\Http\Requests\ReturnVehicleRequest())->rules();

        $validator = Validator::make([
            'mileage_on_return' => 1000,
            'condition' => 'good',
            'additional_charges' => 50.5,
            'notes' => 'Scratch on door',
        ], $rules);

        $this->assertTrue($validator->passes(), json_encode($validator->errors()->all()));
    }
}
