<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ConfigController extends Controller
{
    /**
     * Get pricing configuration
     *
     * Returns all pricing constants including commission rates and add-on prices.
     * This endpoint is public (no authentication required) so frontend can fetch
     * pricing information without being logged in.
     */
    public function pricingConfig()
    {
        $pricingConfig = config('pfe.pricing');
        $commissionConfig = config('pfe.commission');

        return $this->apiSuccessResponse(null, [
            'currency' => $pricingConfig['currency'],
            'currency_symbol' => $pricingConfig['currency_symbol'],
            'default_daily_price' => $pricingConfig['default_daily_price'],
            'add_ons' => $pricingConfig['add_ons'],
            'commission' => $commissionConfig,
        ]);
    }
}
