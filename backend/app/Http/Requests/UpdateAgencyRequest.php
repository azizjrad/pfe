<?php

namespace App\Http\Requests;

use App\Domain\Enums\AgencyStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgencyRequest extends FormRequest
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
            'status' => ['sometimes', Rule::in(AgencyStatus::values())],
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|nullable|string|max:255',
            'address' => 'sometimes|nullable|string',
            'city' => 'sometimes|nullable|string',
            'phone' => 'sometimes|nullable|string',
            'email' => 'sometimes|nullable|email',
            'opening_time' => 'sometimes|nullable|date_format:H:i',
            'closing_time' => 'sometimes|nullable|date_format:H:i',
        ];
    }
}
