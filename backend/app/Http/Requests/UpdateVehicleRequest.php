<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $vehicleId = $this->route('id');

        return [
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:2000|max:' . (date('Y') + 1),
            'mileage' => 'sometimes|integer|min:0',
            'daily_price' => 'sometimes|numeric|min:0',
            'license_plate' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('vehicles', 'license_plate')->ignore($vehicleId),
            ],
            'color' => 'sometimes|string|max:50',
            'seats' => 'sometimes|integer|min:2|max:9',
            'transmission' => 'sometimes|in:manual,automatic',
            'fuel_type' => 'sometimes|in:petrol,diesel,electric,hybrid',
            'status' => 'sometimes|in:available,rented,maintenance',
            'image' => 'nullable|string',
        ];
    }
}
