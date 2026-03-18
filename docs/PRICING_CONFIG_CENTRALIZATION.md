# Pricing Configuration Centralization

## Problem Statement

Pricing constants (commission rate, insurance percentage, delivery fees, etc.) were hardcoded in two separate locations:

1. **Backend**: `ReservationService::calculatePrice()` method
   - Full insurance: 15% of base price (hardcoded)
   - Airport delivery: 10 DT (hardcoded)
   - Home delivery: 25 DT (hardcoded)
   - After-hours pickup: 15 DT (hardcoded)

2. **Frontend**: `ReservationModal.jsx` component
   - Identical pricing values duplicated in component
   - Pricing calculation logic mirrored in JavaScript

**Risk**: If any pricing changes, both backend AND frontend must be updated manually, creating risk of:

- Inconsistency between systems
- Forgotten backend or frontend updates
- Hard to audit where pricing logic lives

## Solution: Backend-Driven Pricing Configuration

### Architecture

```
config/pfe.php (Single Source of Truth)
    ↓
ConfigController::pricingConfig()
    ↓
/api/pricing-config endpoint
    ↓
pricingConfigService (Frontend Cache)
    ↓
ReservationModal (Fetch on Mount)
```

## Backend Implementation

### 1. Configuration File: `config/pfe.php`

All pricing constants centralized in one location:

```php
'pricing' => [
    'currency' => 'TND',
    'currency_symbol' => 'DT',
    'default_daily_price' => 150,
    'add_ons' => [
        'full_insurance' => [
            'type' => 'percentage',
            'value' => 0.15, // 15% of base price
            'display_name' => 'Assurance tous risques',
        ],
        'airport_delivery' => [
            'type' => 'fixed',
            'value' => 10, // Fixed 10 DT
            'display_name' => 'Livraison aéroport',
        ],
        'home_delivery' => [
            'type' => 'fixed',
            'value' => 25, // Fixed 25 DT
            'display_name' => 'Livraison à domicile',
        ],
        'after_hours_pickup' => [
            'type' => 'fixed',
            'value' => 15, // Fixed 15 DT
            'display_name' => 'Prise en charge hors horaires',
        ],
    ],
],

'commission' => [
    'platform_rate' => 0.08, // 8% platform commission
    'min_commission' => 5, // Minimum commission in DT
],
```

**Key Features**:

- `type`: String indicating if price is "percentage" or "fixed"
- `value`: Numeric value (0.15 for 15% or 10 for 10 DT)
- `display_name`: French display name for UI

### 2. API Endpoint: `ConfigController::pricingConfig()`

**File**: `app/Http/Controllers/Api/ConfigController.php`

```php
public function pricingConfig()
{
    $pricingConfig = config('pfe.pricing');
    $commissionConfig = config('pfe.commission');

    return response()->json([
        'success' => true,
        'data' => [
            'currency' => $pricingConfig['currency'],
            'currency_symbol' => $pricingConfig['currency_symbol'],
            'default_daily_price' => $pricingConfig['default_daily_price'],
            'add_ons' => $pricingConfig['add_ons'],
            'commission' => $commissionConfig,
        ],
    ]);
}
```

**Route**:

```php
// Public route (no authentication required)
Route::get('/pricing-config', [ConfigController::class, 'pricingConfig']);
```

**Endpoint**: `GET /api/pricing-config`

**Response**:

```json
{
  "success": true,
  "data": {
    "currency": "TND",
    "currency_symbol": "DT",
    "default_daily_price": 150,
    "add_ons": {
      "full_insurance": {
        "type": "percentage",
        "value": 0.15,
        "display_name": "Assurance tous risques"
      },
      ...
    },
    "commission": {
      "platform_rate": 0.08,
      "min_commission": 5
    }
  }
}
```

### 3. Service Layer: `ReservationService::calculatePrice()`

**File**: `app/Services/ReservationService.php`

Changes:

- **Before**: Hardcoded values (0.15, 10, 25, 15)
- **After**: Reads from `config('pfe.pricing.add_ons')`

```php
public function calculatePrice(
    Vehicle $vehicle,
    Carbon $startDate,
    Carbon $endDate,
    array $options = []
): array {
    // ... date calculations ...

    $addOns = config('pfe.pricing.add_ons', []);

    // Add optional services from config
    if (!empty($options['full_insurance']) && isset($addOns['full_insurance'])) {
        $config = $addOns['full_insurance'];
        $amount = ($config['type'] === 'percentage')
            ? $baseTotal * $config['value']
            : $config['value'];

        $breakdown['options'][] = [
            'name' => $config['display_name'],
            'amount' => round($amount, 2),
        ];
        $breakdown['total'] += $amount;
    }

    // ... similar for other add-ons ...
}
```

**Security**:

- All calculations remain on backend
- Frontend cannot manipulate prices
- Backend validates all user input against config

---

## Frontend Implementation

### 1. Pricing Config Service: `pricingConfigService.js`

**File**: `src/services/pricingConfigService.js`

Features:

- **Caching**: Stores config in memory to avoid repeated requests
- **Fallback**: Provides default configuration if API unavailable
- **Helper Methods**: `getAddOnPrice()`, `calculateTotal()`

```javascript
export const pricingConfigService = {
  async getPricingConfig() {
    // Return cached if available
    if (pricingCache) return pricingCache;

    // Fetch from backend
    const response = await http.get("/pricing-config");
    pricingCache = response.data.data;
    return pricingCache;
  },

  getCachedConfig() {
    return pricingCache;
  },

  clearCache() {
    pricingCache = null;
  },

  getAddOnPrice(addOnKey, basePrice = 0) {
    const addOn = pricingCache.add_ons[addOnKey];
    const actualPrice =
      addOn.type === "percentage" ? basePrice * addOn.value : addOn.value;
    return { ...addOn, actual_price: actualPrice };
  },

  calculateTotal(basePrice, selectedAddOns = {}) {
    // Calculate with selected add-ons
  },
};
```

### 2. ReservationModal Updates

**File**: `src/components/modals/ReservationModal.jsx`

Changes:

- Import `pricingConfigService`
- Add state for `pricingConfig`
- Fetch config on modal open via `useEffect`
- Use config values in pricing calculation and display

```javascript
import { pricingConfigService } from "../../services/pricingConfigService";

const ReservationModal = ({ isOpen, onClose, vehicle, onSubmit }) => {
  const [pricingConfig, setPricingConfig] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const config = await pricingConfigService.getPricingConfig();
      setPricingConfig(config);
    }
  }, [isOpen]);

  // Use pricingConfig in pricing calculation
  const pricing = useMemo(() => {
    const addOns = pricingConfig?.add_ons || {
      full_insurance: { type: "percentage", value: 0.15 },
      airport_delivery: { type: "fixed", value: 10 },
      home_delivery: { type: "fixed", value: 25 },
      after_hours_pickup: { type: "fixed", value: 15 },
    };

    const insurance = options.full_insurance
      ? basePrice * addOns.full_insurance.value
      : 0;

    // ... rest of calculation ...
  }, [options, pricingConfig]);

  // Display names from config
  <div className="font-medium">
    {pricingConfig?.add_ons?.full_insurance?.display_name || "Assurance complète"}
  </div>
  <div className="text-sm">
    +{pricingConfig?.add_ons?.full_insurance?.value || 0.15} DT
  </div>
};
```

---

## Data Flow

### Booking Flow

```
1. ReservationModal mounts
   └─ Fetches /api/pricing-config
      └─ Caches in pricingConfig state

2. User selects dates and options
   └─ useMemo recalculates using pricingConfig values
   └─ Displays prices on UI (all from config)

3. User submits reservation
   └─ Sends to /api/reservations
   └─ ReservationService::calculatePrice() uses config/pfe.php
   └─ Backend validates against config (prevents tampering)
   └─ Response includes pricing_details with final amounts

4. Success response
   └─ Frontend displays confirmation with backend-calculated price
   └─ Both frontend and backend used same config values
```

---

## Changing Pricing

### Example: Increase Insurance From 15% to 20%

**Step 1**: Edit `config/pfe.php`

```php
'full_insurance' => [
    'type' => 'percentage',
    'value' => 0.20, // Changed from 0.15 to 0.20
    'display_name' => 'Assurance tous risques',
],
```

**Step 2**: No other changes needed!

- Frontend automatically fetches new value on modal open
- Backend uses new value on price calculation
- Existing reservations keep their old pricing (stored in database)
- New reservations use new pricing

**No need to**:

- Update ReservationModal.jsx
- Update ReservationService.php
- Restart frontend or backend (config cache can be cleared if needed)

---

## Benefits

### 1. **Single Source of Truth**

- One place to manage all pricing: `config/pfe.php`
- No manual sync between backend/frontend

### 2. **Dynamic Updates**

- Change prices without redeploying code
- Can use environment variables: `'value' => env('FULL_INSURANCE_RATE', 0.15)`

### 3. **Type Safety**

- `type` field indicates "percentage" or "fixed"
- Frontend/backend both parse correctly

### 4. **Display Names**

- Centralized French display names
- Avoid duplicate translations

### 5. **Auditability**

- All pricing changes in one config file
- Easy to see price history in version control

### 6. **Backward Compatibility**

- Frontend has fallback values if API unavailable
- Old reservations keep original pricing (stored in database)
- Can adjust historical pricing if needed

### 7. **Security**

- Frontend cannot manipulate prices (calculations sent to backend)
- Backend validates all inputs against config
- Config is immutable at runtime

---

## Testing

### Backend Testing

```bash
# Verify config is loaded
php artisan tinker
> config('pfe.pricing.add_ons')

# Test endpoint
curl http://localhost:8000/api/pricing-config

# Test price calculation
php artisan tinker
> app('App\Services\ReservationService')->calculatePrice($vehicle, $start, $end, ['full_insurance' => true])
```

### Frontend Testing

```javascript
// In browser console
import { pricingConfigService } from "./services/pricingConfigService.js";
await pricingConfigService.getPricingConfig();
pricingConfigService.getCachedConfig();
```

---

## Files Modified

| File                                            | Changes                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `config/pfe.php`                                | Added `add_ons` array with all pricing config                        |
| `app/Http/Controllers/Api/ConfigController.php` | Created new controller for `/api/pricing-config`                     |
| `routes/api.php`                                | Added public route for `/api/pricing-config`                         |
| `app/Services/ReservationService.php`           | Updated `calculatePrice()` to use config instead of hardcoded values |
| `src/services/pricingConfigService.js`          | New service for fetching/caching pricing config                      |
| `src/components/modals/ReservationModal.jsx`    | Updated to fetch and use dynamic pricing from config                 |

---

## Environment-Specific Pricing

For different pricing in different environments:

```php
// config/pfe.php
'pricing' => [
    'add_ons' => [
        'full_insurance' => [
            'type' => 'percentage',
            'value' => env('FULL_INSURANCE_RATE', 0.15),
            'display_name' => 'Assurance tous risques',
        ],
        'airport_delivery' => [
            'type' => 'fixed',
            'value' => env('AIRPORT_DELIVERY_FEE', 10),
            'display_name' => 'Livraison aéroport',
        ],
    ],
],
```

Then set in `.env`:

```
FULL_INSURANCE_RATE=0.20
AIRPORT_DELIVERY_FEE=12
```

---

## Future Enhancements

1. **Database-Driven Pricing**: Move config to database for runtime changes without cache clearing
2. **Pricing History**: Track price changes over time
3. **Seasonal Pricing**: Different rates for different seasons
4. **Promotional Pricing**: Temporary discounts applied per customer/vehicle
5. **Admin Dashboard**: UI to change pricing without code/config edits
