<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'role' => 'required|in:client,agency_admin',
            'phone' => 'required|string|size:8',
            'address' => 'nullable|string|max:500',
            'agency_name' => 'required_if:role,agency_admin|string|max:255',
            'agency_location' => 'required_if:role,agency_admin|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'password.regex' => 'Password must contain at least one lowercase, one uppercase, one digit and one special character (@$!%*?&).',
        ];
    }
}
