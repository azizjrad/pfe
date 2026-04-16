<?php

namespace App\Http\Requests;

use App\Domain\Enums\VehicleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
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
        return [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'mileage' => 'required|integer|min:0',
            'daily_price' => 'required|numeric|min:0',
            'caution_amount' => 'nullable|numeric|min:0',
            'license_plate' => 'required|string|max:50|unique:vehicles,license_plate',
            'color' => 'required|string|max:50',
            'seats' => 'required|integer|min:2|max:9',
            'transmission' => 'required|in:manual,automatic',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'status' => ['sometimes', Rule::in(VehicleStatus::values())],
            'image' => 'nullable|string',
        ];
    }
}
