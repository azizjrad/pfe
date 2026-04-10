<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Client users can make reservations
        return $this->user()->role === 'client';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'pickup_location' => 'required|string|max:255',
            'dropoff_location' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'client_birth_date' => 'nullable|date',
            'driver_first_name' => 'nullable|string|max:255',
            'driver_last_name' => 'nullable|string|max:255',
            'driver_birth_date' => 'nullable|date',
            'driver_license_number' => 'nullable|string|max:255',
            'driver_license_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'options' => 'nullable|array:airport_delivery,home_delivery,after_hours_pickup',
            'options.airport_delivery' => 'nullable|boolean',
            'options.home_delivery' => 'nullable|boolean',
            'options.after_hours_pickup' => 'nullable|boolean',
            'pricing_breakdown' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'Le véhicule est requis.',
            'vehicle_id.exists' => 'Le véhicule sélectionné n\'existe pas.',
            'start_date.required' => 'La date de début est requise.',
            'start_date.date' => 'La date de début doit être une date valide.',
            'start_date.after_or_equal' => 'La date de début doit être aujourd\'hui ou après.',
            'end_date.required' => 'La date de fin est requise.',
            'end_date.date' => 'La date de fin doit être une date valide.',
            'end_date.after' => 'La date de fin doit être après la date de début.',
            'pickup_location.required' => 'Le lieu de prise en charge est requis.',
            'phone.required' => 'Le numéro de téléphone est requis.',
            'email.email' => 'L\'adresse email doit être valide.',
        ];
    }
}
