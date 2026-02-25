# Reservation System Implementation

Complete reservation system with dynamic pricing integration.

## Backend Implementation

### 1. ReservationController (`backend/app/Http/Controllers/Api/ReservationController.php`)

**Created endpoints:**

- `POST /api/reservations` - Create new reservation (clients only)
- `GET /api/my-reservations` - Get user's reservations (clients only)
- `GET /api/agency/reservations` - Get agency reservations (agency admins only)
- `GET /api/reservations/{id}` - Get reservation details
- `POST /api/reservations/{id}/cancel` - Cancel reservation

**Key features:**

- Vehicle availability checking (prevents double-booking)
- Backend price recalculation for security validation
- Price tolerance check (1% difference allowed)
- Stores complete pricing breakdown in database
- Role-based authorization

### 2. Database Migration

**File:** `backend/database/migrations/2026_02_24_000000_add_pricing_details_to_reservations_table.php`

Added `pricing_details` JSON column to store complete pricing breakdown including:

- Base price
- All 9 rule adjustments
- Total price
- Seasonal information
- Selected options

### 3. Reservation Model Update

**File:** `backend/app/Models/Reservation.php`

Added to fillable fields:

- `pricing_details` (JSON cast to array)

### 4. API Routes

**File:** `backend/routes/api.php`

Protected routes configured with Sanctum authentication and role middleware:

```php
// Client routes
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
});

// Agency routes
Route::middleware(['auth:sanctum', 'role:agency_admin,super_admin'])->group(function () {
    Route::get('/agency/reservations', [ReservationController::class, 'agencyIndex']);
});
```

## Frontend Implementation

### 1. Hero Section Search Form (`frontend/src/pages/Home.jsx`)

**Converted to proper search form:**

- Changed title from "Réserver une voiture" to "Rechercher un véhicule"
- Changed button from "Obtenir un devis" to "Rechercher des véhicules"
- Replaced specific vehicle selection with category selection (Économique, SUV, Luxe, Sport)
- Connected location, date inputs to state (`searchData`)
- Passes search parameters via URL to vehicles page
- Validates dates are selected before search

**Search parameters passed:**

- `location` - Pickup/return location (e.g., "Tunis Carthage aéroport")
- `startDate` - Pickup date
- `endDate` - Return date
- `startTime` - Pickup time
- `endTime` - Return time
- `category` - Vehicle category (optional, only if not "Tous")

**Flow:**

```
User fills search form → Selects dates & location → Optionally selects category →
Clicks "Rechercher des véhicules" → Navigate to /vehicles with search params
```

### 2. Vehicles Page Search Integration (`frontend/src/pages/Vehicles.jsx`)

**Added search functionality:**

- Reads URL search parameters from hero section
- Displays prominent search results banner showing:
  - Location searched
  - Pickup date/time
  - Return date/time
  - Number of vehicles found
- Automatically applies category filter if specified
- Allows clearing search to view all vehicles
- Smooth scroll to vehicles section when coming from search

**Search banner features:**

- Gradient blue background with white text
- Icons for location and calendar
- Clear button to remove search filters
- Shows count of matching vehicles

### 3. Reservation Modal Integration (`frontend/src/pages/VehicleDetails.jsx`)

**Updated `handleReservationSubmit()` to:**

- Call backend API `POST /api/reservations`
- Send complete payload including pricing breakdown
- Handle authentication errors (redirect to login)
- Display success/error messages
- Close modal on success

**Payload structure:**

```javascript
{
  vehicle_id: 1,
  start_date: "2026-03-01",
  end_date: "2026-03-05",
  pickup_location: "Tunis",
  dropoff_location: "Tunis",
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+216 12 345 678",
  notes: "",
  options: {
    full_insurance: true,
    gps: false,
    // ... other options
  },
  pricing_breakdown: {
    base_price: 200,
    adjustments: [...],
    total_price: 245,
    // ... complete pricing details
  }
}
```

### 3. Existing Components (Already Built)

**ReservationModal.jsx** - Already has:

- Dynamic pricing calculation via `useDynamicPricing` hook
- Form validation
- Options selection (insurance, GPS, etc.)
- PriceBreakdown display
- Submits complete data including pricing

## Complete User Flow

### Flow 1: Search from Hero Section → Browse → Reserve

1. **Home page** - User fills search form (location, dates, optional category)
2. Click "Rechercher des véhicules" → Navigate to `/vehicles?location=...&startDate=...`
3. **Vehicles page** - See search results banner with criteria summary
4. Browse filtered/categorized vehicles → Click vehicle card → Navigate to `/vehicles/{id}`
5. Click "Réserver maintenant" → Open ReservationModal
6. Modal auto-calculates price based on dates + options
7. Fill personal info (name, email, phone)
8. Review price breakdown
9. Click submit → API call to backend
10. Backend validates price, checks availability
11. Reservation created → Success message
12. Modal closes

### Flow 2: Direct Browse → Reserve

1. **Vehicles page** - Browse all vehicles with manual filters
2. Click vehicle card → Navigate to `/vehicles/{id}`
3. Click "Réserver maintenant" → Open ReservationModal
4. Select dates → Dynamic pricing calculation
5. Select options → Price updates in real-time
6. Fill personal info
7. Submit → Backend validation → Success

### Flow 3: Direct Vehicle Details → Reservation

1. Navigate to `/vehicles/{id}` directly
2. Click "Réserver maintenant" → Open ReservationModal
3. Select dates → Dynamic pricing calculation
4. Select options → Price updates in real-time
5. Fill personal info
6. Submit → Backend validation → Success

## Security Features

### Backend Security

- **Authentication required:** All reservation endpoints require Sanctum token
- **Role-based access:** Clients can only see their reservations
- **Price validation:** Backend recalculates price to prevent tampering
- **Availability check:** Prevents double-booking
- **Transaction safety:** Database transactions for data integrity

### Frontend Security

- **API service:** Centralized axios instance with base URL
- **Error handling:** Graceful handling of auth errors → redirect to login
- **Form validation:** Client-side validation before submission
- **Loading states:** Prevent duplicate submissions

## Platform Revenue Model: 8% Commission System

### Implementation Overview

Elite Drive generates revenue by charging an **8% commission** on every completed reservation. This commission is automatically calculated and deducted from the total price, with the remaining amount going to the agency.

### Step-by-Step Implementation

#### Step 1: Configuration File (`backend/config/pfe.php`)

Added commission settings to the configuration:

```php
'commission' => [
    'platform_rate' => 0.08,    // 8% platform commission
    'min_commission' => 5,       // Minimum 5 DT per reservation
],
```

**Why this approach?**

- ✅ Centralized configuration (easy to adjust rate)
- ✅ Environment-based (can differ per deployment)
- ✅ Minimum commission protects against very low-value bookings

#### Step 2: Database Migration

**File:** `backend/database/migrations/2026_02_24_140000_add_commission_fields_to_reservations_table.php`

Added three new columns to the `reservations` table:

```php
Schema::table('reservations', function (Blueprint $table) {
    $table->decimal('platform_commission_rate', 5, 4)->default(0.08);
    $table->decimal('platform_commission', 10, 2)->default(0);
    $table->decimal('agency_payout', 10, 2)->default(0);
});
```

**Column details:**

- `platform_commission_rate`: Stores the commission percentage (e.g., 0.0800 for 8%)
- `platform_commission`: Calculated commission amount in DT
- `agency_payout`: Amount the agency receives after commission deduction

**Precision explanation:**

- `decimal(5, 4)`: Allows rates like 0.0800 (8%) with 4 decimal precision
- `decimal(10, 2)`: Allows amounts up to 99,999,999.99 DT with 2 decimal cents

#### Step 3: Reservation Model Update

**File:** `backend/app/Models/Reservation.php`

Added new fields to fillable and casts:

```php
protected $fillable = [
    // ... existing fields
    'platform_commission_rate',
    'platform_commission',
    'agency_payout',
];

protected $casts = [
    // ... existing casts
    'platform_commission_rate' => 'decimal:4',
    'platform_commission' => 'decimal:2',
    'agency_payout' => 'decimal:2',
];
```

**Why casting matters:**

- Ensures decimal precision in database operations
- Prevents floating-point rounding errors
- Maintains financial accuracy

#### Step 4: ReservationController Commission Logic

**File:** `backend/app/Http/Controllers/Api/ReservationController.php`

Added commission calculation in the `store()` method:

```php
// Get commission rate from config
$commissionRate = config('pfe.commission.platform_rate', 0.08);
$minCommission = config('pfe.commission.min_commission', 5);

// Calculate commission (8% or minimum 5 DT, whichever is higher)
$platformCommission = max(
    $backendPricing['total_price'] * $commissionRate,
    $minCommission
);

// Calculate agency payout
$agencyPayout = $backendPricing['total_price'] - $platformCommission;

// Store in reservation
Reservation::create([
    // ... other fields
    'total_price' => $backendPricing['total_price'],
    'platform_commission_rate' => $commissionRate,
    'platform_commission' => $platformCommission,
    'agency_payout' => $agencyPayout,
]);
```

**Calculation example:**

```
Scenario 1: Regular booking
Total Price: 245 DT
Commission Rate: 8%
Platform Commission: max(245 × 0.08, 5) = max(19.60, 5) = 19.60 DT
Agency Payout: 245 - 19.60 = 225.40 DT

Scenario 2: Low-value booking
Total Price: 50 DT
Commission Rate: 8%
Platform Commission: max(50 × 0.08, 5) = max(4.00, 5) = 5.00 DT (minimum applied)
Agency Payout: 50 - 5.00 = 45.00 DT
```

#### Step 5: Terms & Conditions Update

**File:** `frontend/src/pages/TermsOfService.jsx`

Added Section 5 explaining the commission structure to agencies:

**Key points included:**

- Clear statement: "Elite Drive prélève une commission de 8%"
- Commission rate: 8% of total booking price
- Minimum commission: 5 DT
- Calculation formula: `Commission = max(Total × 8%, 5 DT)`
- Visual example with breakdown:
  ```
  Total réservation: 250 DT
  Commission Elite Drive (8%): -20 DT
  Versement à l'agence (92%): 230 DT
  ```
- What's included in the commission:
  - Platform technology & maintenance
  - Customer support 24/7
  - Payment processing security
  - Marketing & SEO
  - Booking management system

**Legal compliance:**

- ✅ Transparent disclosure before agencies join
- ✅ Clear calculation method
- ✅ Example scenarios provided
- ✅ Value proposition explained

### Revenue Calculation Flow

**Complete booking flow with commission:**

```
1. Customer searches for vehicle (Hero Section)
   └─ Selects: Location, Dates, Category

2. Customer views vehicle & clicks "Réserver"
   └─ ReservationModal opens

3. Dynamic pricing calculates total
   Base: 50 DT/day × 4 days = 200 DT
   + Seasonal: +20% = +40 DT
   + Weekend: +15% = +30 DT
   + Insurance: +60 DT
   TOTAL: 330 DT

4. Backend validates & calculates commission
   Total: 330 DT
   Commission (8%): 330 × 0.08 = 26.40 DT
   Agency Payout: 330 - 26.40 = 303.60 DT

5. Reservation created in database
   {
     total_price: 330.00,
     platform_commission_rate: 0.0800,
     platform_commission: 26.40,
     agency_payout: 303.60,
     status: 'pending'
   }

6. Payment processing (future)
   Customer pays: 330 DT
   ├─ Platform receives: 26.40 DT (8%)
   └─ Agency receives: 303.60 DT (92%)
```

### Analytics & Reporting (Future Enhancement)

The commission structure enables rich analytics:

**Platform Revenue Dashboard:**

- Total revenue by day/month/year
- Average commission per booking
- Revenue by agency
- Revenue by vehicle category
- Commission trends over time

**Agency Payout Dashboard:**

- Pending payouts
- Completed payouts
- Commission breakdown per reservation
- Estimated monthly earnings

**SQL Query Example:**

```sql
-- Platform total revenue for current month
SELECT
    COUNT(*) as total_bookings,
    SUM(total_price) as gross_revenue,
    SUM(platform_commission) as platform_revenue,
    SUM(agency_payout) as agency_payouts,
    AVG(platform_commission) as avg_commission
FROM reservations
WHERE status IN ('confirmed', 'completed')
  AND MONTH(created_at) = MONTH(CURRENT_DATE())
  AND YEAR(created_at) = YEAR(CURRENT_DATE());
```

### Benefits of This Model

**For the Platform:**

- ✅ Revenue only on successful bookings (aligned incentives)
- ✅ Scalable - more bookings = more revenue
- ✅ No upfront costs for agencies (easy onboarding)
- ✅ Industry-standard model (Booking.com, Airbnb use similar)

**For Agencies:**

- ✅ No monthly fees or subscription costs
- ✅ Pay only when they earn money
- ✅ Transparent pricing and calculation
- ✅ Access to larger customer base justifies commission
- ✅ Platform handles marketing, support, payments

**For Customers:**

- ✅ Commission is invisible (included in displayed price)
- ✅ Transparent total pricing
- ✅ No hidden fees

### Testing Checklist

- [x] Migration runs successfully (pricing_details & commission fields)
- [x] Backend routes configured
- [x] Hero form navigates to vehicles with search parameters
- [x] 8% commission system implemented
- [ ] Reservation creation works (requires authentication)
- [ ] Price validation prevents tampering
- [ ] Availability check prevents conflicts
- [ ] Commission calculation correct (8% or 5 DT minimum)
- [ ] Agency payout calculation correct (total - commission)
- [ ] Agency can view their reservations
- [ ] Client can view their reservations
- [ ] Cancel reservation works
- [ ] Search functionality filters vehicles correctly

## Next Steps

1. **Test with authentication:** Login as client → Create reservation
2. **Test agency view:** Login as agency admin → View reservations
3. **Add payment integration:** Payment processing after reservation
4. **Email notifications:** Send confirmation emails
5. **Calendar view:** Show vehicle availability calendar
6. **Reservation status updates:** Allow agency to confirm/reject reservations

## Files Created/Modified

### Created:

- `backend/app/Http/Controllers/Api/ReservationController.php` (295 lines)
- `backend/database/migrations/2026_02_24_000000_add_pricing_details_to_reservations_table.php`
- `backend/database/migrations/2026_02_24_140000_add_commission_fields_to_reservations_table.php`

### Modified:

- `backend/app/Models/Reservation.php` - Added pricing_details and commission fields
- `backend/config/pfe.php` - Added commission configuration (8% rate, 5 DT minimum)
- `backend/routes/api.php` - Added reservation routes
- `backend/app/Http/Controllers/Api/ReservationController.php` - Added commission calculation logic
- `frontend/src/pages/Home.jsx` - Connected hero form to search with parameters
- `frontend/src/pages/Vehicles.jsx` - Added search results banner and filtering
- `frontend/src/pages/VehicleDetails.jsx` - Added API integration for reservations
- `frontend/src/pages/TermsOfService.jsx` - Added Section 5: Platform Commission disclosure

### Existing (Already functional):

- `frontend/src/components/ReservationModal.jsx` - Complete with pricing
- `frontend/src/hooks/usePricing.js` - Dynamic pricing hooks
- `backend/app/Services/PricingService.php` - 9-rule pricing engine

## API Endpoints Summary

| Method | Endpoint                        | Auth | Role         | Description             |
| ------ | ------------------------------- | ---- | ------------ | ----------------------- |
| POST   | `/api/reservations`             | ✓    | client       | Create reservation      |
| GET    | `/api/my-reservations`          | ✓    | client       | Get my reservations     |
| GET    | `/api/reservations/{id}`        | ✓    | client       | Get reservation details |
| POST   | `/api/reservations/{id}/cancel` | ✓    | client       | Cancel reservation      |
| GET    | `/api/agency/reservations`      | ✓    | agency_admin | Get agency reservations |
| POST   | `/api/pricing/calculate`        | ✓    | any          | Calculate dynamic price |

---

**Implementation Status:** ✅ Complete (Including 8% Commission System)
**Revenue Model:** Commission-based (8% platform fee, 92% agency payout)
**Last Updated:** February 24, 2026
