# Client Reliability Score - Calculation Guide

This file explains exactly how the client reliability score is calculated in the current codebase.

## 1) Is the score float or int?

The reliability score is an integer (normal int), not a float.

Why:

- Database column type is integer:
  - `backend/database/migrations/2024_01_08_000000_create_client_scores_table.php`
  - `reliability_score` is created with `$table->integer(...)`
- Model cast is integer:
  - `backend/app/Models/ClientReliabilityScore.php`
  - `'reliability_score' => 'integer'`
- Service code also reads/casts it as int:
  - `backend/app/Services/ClientService.php`

Note:

- `total_unpaid_amount` is decimal(10,2), but this field is currently tracked only and is not part of the active score formula.

## 2) Current score formula

Initial score starts at `100`.

Penalties are subtracted based on behavior:

- cancelled reservations
- late returns
- payment delays
- damage incidents

Formula used in model:

`score = 100 - (cancelled * cancelled_penalty + late_returns * late_return_penalty + payment_delays * payment_delay_penalty + damage_incidents * damage_penalty)`

Then score is clamped:

- minimum `0`
- maximum `100`

Final behavior:

- `score < 0` becomes `0`
- `score > 100` becomes `100`

## 3) Penalty values from config

From `backend/config/pfe.php`:

- `cancelled_penalty = 5`
- `late_return_penalty = 10`
- `payment_delay_penalty = 15`
- `damage_penalty = 20`

So practically:

- each cancellation: `-5`
- each late return: `-10`
- each payment delay: `-15`
- each damage incident: `-20`

## 4) Data sources used for recalculation

Recalculation is done in:

- `backend/app/Services/ClientService.php` -> `recalculateReliabilityScore(...)`

Counters are built from user reservations:

- total reservations
- completed reservations
- cancelled reservations
- late returns (`is_late_return = true`)
- payment delays (`payment_status = overdue`)
- damage incidents (vehicle return condition in `fair` or `damaged`)
- total unpaid amount (sum of `remaining_amount > 0`, stored only)

After filling counters, service calls:

- `calculateScore()` in `backend/app/Models/ClientReliabilityScore.php`

## 5) Risk level mapping

In model (`determineRiskLevel`):

- if score < blocked_threshold (30): `blocked`
- else if score < high_risk_threshold (50): `high`
- else if score < medium_risk_threshold (80): `medium`
- else: `low`

Default thresholds from config:

- blocked_threshold = 30
- high_risk_threshold = 50
- medium_risk_threshold = 80

## 6) Booking restriction rule

In reservation booking flow:

- `backend/app/Services/ReservationService.php`
- booking is blocked if score is `< 40`

Important:

- This booking threshold (`40`) is stricter than the model blocked threshold (`30`).
- So a client can be `high risk` and still blocked from booking when score is between `30` and `39`.

## 7) Example

Given:

- cancelled = 2
- late_returns = 1
- payment_delays = 1
- damage_incidents = 0

Penalty:

- `2*5 + 1*10 + 1*15 + 0*20 = 35`

Score:

- `100 - 35 = 65`

Result:

- stored score = `65` (int)
- risk level = `medium` (because < 80 and >= 50)
- booking allowed = yes (because 65 >= 40)

## 8) Summary

- Score type: integer.
- Range: 0 to 100.
- Formula: base 100 minus configured penalties.
- `total_unpaid_amount` is tracked but not yet included in active scoring formula.
- Booking block currently starts at score < 40.
