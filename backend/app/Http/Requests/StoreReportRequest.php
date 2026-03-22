<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
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
            'report_type' => 'required|in:vehicle,agency,client',
            'target_id' => 'required|integer',
            'target_name' => 'required|string|max:255',
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
            'reported_by_name' => 'required|string|max:255',
        ];
    }
}
