<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => 'nullable|string|min:6',
            'role' => ['required', Rule::in(['client', 'agency_admin', 'super_admin'])],
            'agency_id' => 'nullable|integer|exists:agencies,id',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ];
    }
}
