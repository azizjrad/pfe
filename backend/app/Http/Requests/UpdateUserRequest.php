<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
            'is_suspended' => 'sometimes|boolean',
            'suspension_reason' => 'nullable|string|max:500',
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('id'))],
            'phone' => 'sometimes|nullable|string',
            'role' => ['sometimes', Rule::in(['client', 'agency_admin', 'super_admin'])],
        ];
    }
}
