<?php

namespace App\Http\Requests;

use App\Domain\Enums\ReportStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReportStatusRequest extends FormRequest
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
            'status' => ['required', Rule::in(ReportStatus::values())],
            'admin_notes' => [
                Rule::requiredIf(function (): bool {
                    return in_array(
                        (string) $this->input('status'),
                        ReportStatus::resolutionValues(),
                        true
                    );
                }),
                'nullable',
                'string',
            ],
        ];
    }
}
