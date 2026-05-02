<?php

namespace App\Http\Requests;

use App\Models\User;
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
            'email' => [
                'required',
                'email',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $existingUser = User::where('email', $value)->first();
                    if (!$existingUser) {
                        return;
                    }

                    $isReplaceFlow =
                        $this->input('role') === 'agency_admin'
                        && ($this->input('agency_option') ?? 'existing') === 'existing'
                        && (int) $this->input('agency_id') > 0
                        && $existingUser->role === 'agency_admin'
                        && (int) $existingUser->agency_id === (int) $this->input('agency_id');

                    if (!$isReplaceFlow) {
                        $fail('The email has already been taken.');
                    }
                },
            ],
            'password' => 'nullable|string|min:6',
            'role' => ['required', Rule::in(['client', 'agency_admin', 'super_admin'])],
            'agency_option' => ['nullable', Rule::in(['existing', 'new'])],
            'agency_id' => [
                'nullable',
                'integer',
                'exists:agencies,id',
                'required_if:role,agency_admin',
                'required_if:agency_option,existing',
            ],
            'agency' => ['nullable', 'array', 'required_if:agency_option,new'],
            'agency.name' => ['nullable', 'string', 'max:255', 'required_if:agency_option,new'],
            'agency.address' => 'nullable|string|max:255',
            'agency.city' => 'nullable|string|max:255',
            'agency.phone' => 'nullable|string|max:50',
            'agency.email' => 'nullable|email|max:255|unique:agencies,email',
            'agency.opening_time' => 'nullable|date_format:H:i',
            'agency.closing_time' => 'nullable|date_format:H:i',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ];
    }
}
