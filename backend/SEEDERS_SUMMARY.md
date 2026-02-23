# Database Seeders - Summary

## ✅ Successfully Populated Tables

| Table                         | Count | Description                                                                                       |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------------------- |
| **agencies**                  | 5     | Rental agencies across Tunisia (Tunis Centre, Aéroport Carthage, Sousse, Sfax, Hammamet)          |
| **categories**                | 5     | Vehicle categories (Économique, Berline, SUV, Luxe, Utilitaire)                                   |
| **users**                     | 7     | Test users with 3 roles: 1 super_admin, 3 agency_admins, 3 clients                                |
| **vehicles**                  | 12    | Realistic Tunisian vehicles (Renault, Peugeot, Toyota, Mercedes, BMW, etc.)                       |
| **reservations**              | 7     | Sample bookings with various statuses (pending, confirmed, ongoing, completed, cancelled)         |
| **payments**                  | 6     | Payment records with different methods (cash, cheque) and types (deposit, partial, full, balance) |
| **returns**                   | 3     | Vehicle return inspections with various conditions and additional charges                         |
| **client_reliability_scores** | 3     | Client risk assessment scores (low to high risk)                                                  |
| **pricing_rules**             | 6     | Dynamic pricing rules (seasonal, duration-based, agency fees, category promotions)                |

## 📊 Test Data Details

### Users

- **Super Admin**: admin@location.tn (password: `password`)
- **Agency Admins**:
    - ahmed.tunis@location.tn (Agence Tunis Centre)
    - fatma.aeroport@location.tn (Agence Aéroport Carthage)
    - mohamed.sousse@location.tn (Agence Sousse)
- **Clients**:
    - sami.jrad@email.tn (Reliable client, score: 90)
    - amira.gharbi@email.tn (New client, score: 100)
    - karim.bouazizi@email.tn (High-risk client, score: 38)

### Reservations

1. **Completed** - Sami Jrad rented Renault Clio (400 DT paid)
2. **Ongoing** - Amira Gharbi renting Kia Sportage (partially paid: 320/1008 DT)
3. **Confirmed** - Karim Bouazizi booked Mercedes Classe C (partially paid: 310.50/1035 DT)
4. **Completed with late return** - Sami Jrad rented Toyota Corolla (600 DT including late fees)
5. **Cancelled** - Karim Bouazizi cancelled Peugeot 208
6. **Pending** - Amira Gharbi pending Nissan Qashqai
7. **Completed unpaid** - Karim Bouazizi owes 280 DT (contributes to high risk score)

### Pricing Rules

- **Haute saison été**: +25% during June-August
- **Réduction longue durée**: -10% for rentals ≥7 days
- **Supplément aéroport**: +15% at Aéroport Carthage agency
- **Promotion Luxe**: -20% on luxury category (30 days promotion)
- **Réduction mensuelle**: -25% for rentals ≥30 days
- **Forfait week-end**: Fixed 200 DT for 2-3 days in Économique category

## 🎯 Business Logic Demonstrated

### Client Reliability Scoring

- **Sami Jrad** (Score: 90): 1 late return penalty = -10 points
- **Amira Gharbi** (Score: 100): Perfect client, no penalties
- **Karim Bouazizi** (Score: 38): Multiple penalties
    - 1 cancellation (-5)
    - 1 payment delay (-15)
    - 1 damage incident (-20)
    - 730 DT unpaid (-22)
    - **Risk Level**: HIGH

### Payment Tracking

- Demonstrates cash, cheque, and partial payment scenarios
- Cheque status tracking (pending_deposit, cleared)
- Late return additional charges
- Damage repair charges

### Vehicle Availability

- Vehicle #6 (Kia Sportage) currently rented (status: 'rented')
- Vehicle #11 (BMW Série 3) in maintenance
- Other vehicles available for booking

## 🚀 Usage

All seeders can be run with:

```bash
php artisan migrate:fresh --seed
```

Individual seeders:

```bash
php artisan db:seed --class=AgencySeeder
php artisan db:seed --class=CategorySeeder
# ... etc
```

## ⚠️ Important Notes

1. **Foreign Key Dependencies**: Seeders must run in this order:
    1. AgencySeeder
    2. CategorySeeder
    3. UserSeeder (depends on agencies)
    4. VehicleSeeder (depends on agencies + categories)
    5. ReservationSeeder (depends on users + vehicles)
    6. PaymentSeeder (depends on reservations)
    7. VehicleReturnSeeder (depends on reservations)
    8. ClientReliabilityScoreSeeder (depends on users)
    9. PricingRuleSeeder

2. **Password**: All test users have password `password` (hashed with bcrypt)

3. **Tunisian Context**:
    - All locations, names, phone numbers are Tunisia-specific
    - Currency: Tunisian Dinar (DT)
    - License plate format: TUN-XXX-XXX, SUS-XXX-XXX, SFX-XXX-XXX, HAM-XXX-XXX
    - Cities: Tunis, Sousse, Sfax, Hammamet

4. **Data Integrity**: All foreign keys, relationships, and constraints are properly maintained

## 📝 Next Steps

- Build authentication API endpoints (Laravel Sanctum)
- Create CRUD controllers for all resources
- Implement reservation workflow endpoints
- Add client reliability score calculation API
- Create pricing calculation endpoint with rule application
- Build dashboard statistics endpoints
