<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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
            'agency_id' => 'required|exists:agencies,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|max:1000',
        ];
    }
}
