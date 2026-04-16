<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Services\AgencyService;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    private AgencyService $agencyService;

    public function __construct(AgencyService $agencyService)
    {
        $this->agencyService = $agencyService;
    }

    /**
     * Get statistics for the authenticated agency admin's agency
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        if (!$user->agency_id) {
            return $this->apiErrorMessageResponse('No agency associated with this account', 400);
        }

        $agency = Agency::findOrFail($user->agency_id);
        $this->authorize('view', $agency);

        $stats = $this->agencyService->getStats($user->agency_id);

        return $this->apiSuccessResponse(null, $stats);
    }

    /**
     * Get 6-month financial statistics for the authenticated agency
     */
    public function getFinancialStats(Request $request)
    {
        $user = $request->user();

        if (!$user->agency_id) {
            return $this->apiErrorMessageResponse('No agency associated with this account', 400);
        }

        $agency = Agency::findOrFail($user->agency_id);
        $this->authorize('view', $agency);

        $stats = $this->agencyService->getFinancialStats($user->agency_id);

        return $this->apiSuccessResponse(null, $stats);
    }
}

