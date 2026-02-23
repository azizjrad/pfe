# Intégration du Système de Tarification Dynamique dans ReservationModal

## Vue d'ensemble

Ce document explique en détail comment le système de tarification dynamique d'Elite Drive est intégré dans le composant `ReservationModal.jsx`, permettant un calcul de prix transparent et en temps réel lors du processus de réservation.

---

## Architecture de l'Intégration

### Diagramme de Flux de Données

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ReservationModal.jsx                          │
│                                                                      │
│  ┌────────────────┐                                                 │
│  │  User Actions  │                                                 │
│  │  - Select dates│                                                 │
│  │  - Toggle opts │                                                 │
│  └────────┬───────┘                                                 │
│           │                                                          │
│           ▼                                                          │
│  ┌────────────────────────────────────────────────────┐             │
│  │          State Management                           │             │
│  │  • reservationData: { startDate, endDate, ... }    │             │
│  │  • options: { full_insurance, gps, ... }           │             │
│  └────────────────┬───────────────────────────────────┘             │
│                   │                                                  │
│                   ▼                                                  │
│  ┌────────────────────────────────────────────────────┐             │
│  │    useDynamicPricing Hook (Custom Hook)            │             │
│  │    • Monitors: vehicleId, dates, options           │             │
│  │    • Triggers: API call when dependencies change   │             │
│  │    • Returns: { pricing, loading, error }          │             │
│  └────────────────┬───────────────────────────────────┘             │
│                   │                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    │ HTTP POST Request
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend API (Laravel)                             │
│                                                                      │
│  POST /api/pricing/calculate                                        │
│  {                                                                   │
│    vehicle_id: 1,                                                   │
│    start_date: "2026-07-15",                                        │
│    end_date: "2026-07-22",                                          │
│    options: { full_insurance: true, gps: true, ... }                │
│  }                                                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────┐             │
│  │       PricingController::calculatePrice()          │             │
│  │       • Validates request                          │             │
│  │       • Calls PricingService                       │             │
│  │       • Returns JSON response                      │             │
│  └────────────────┬───────────────────────────────────┘             │
│                   │                                                  │
│                   ▼                                                  │
│  ┌────────────────────────────────────────────────────┐             │
│  │         PricingService::calculatePrice()           │             │
│  │         • Applies 9 pricing rules sequentially     │             │
│  │         • Builds transparent breakdown             │             │
│  │         • Returns detailed pricing array           │             │
│  └────────────────┬───────────────────────────────────┘             │
│                   │                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    │ JSON Response
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ReservationModal.jsx                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────┐             │
│  │         PriceBreakdown Component                   │             │
│  │         • Displays total price prominently         │             │
│  │         • Shows all adjustments with colors        │             │
│  │         • Displays "Prix garanti" badge            │             │
│  └────────────────────────────────────────────────────┘             │
│                   │                                                  │
│                   ▼                                                  │
│  ┌────────────────────────────────────────────────────┐             │
│  │     User Confirms & Submits Reservation            │             │
│  │     • Includes full pricing_breakdown              │             │
│  │     • Backend saves breakdown to reservations      │             │
│  └────────────────────────────────────────────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Mécanisme d'Intégration Détaillé

### 1. État du Composant (State Management)

Le composant `ReservationModal` maintient deux états principaux pour la tarification :

```jsx
// Données de réservation (dates, informations personnelles)
const [reservationData, setReservationData] = useState({
  startDate: "", // Date de début (YYYY-MM-DD)
  endDate: "", // Date de fin (YYYY-MM-DD)
  fullName: "", // Nom complet du client
  email: "", // Email de contact
  phone: "", // Numéro de téléphone
});

// Options de tarification (envoyées à PricingService)
const [options, setOptions] = useState({
  // Assurance
  full_insurance: false, // +15% du sous-total

  // Équipements
  gps: false, // +5 DT/jour
  child_seat: false, // +3 DT/jour
  additional_driver: false, // +8 DT/jour

  // Services spéciaux
  airport_delivery: false, // +10 DT (unique)
  home_delivery: false, // +25 DT (unique)
  after_hours_pickup: false, // +15 DT (unique)

  // Kilométrage
  mileage_option: "200km", // "100km" | "200km" | "unlimited"
});
```

**Pourquoi cette séparation ?**

- `reservationData` : Informations client et période (obligatoires pour toute réservation)
- `options` : Choix tarifaires envoyés directement à l'API de pricing

### 2. Hook de Tarification Dynamique

Le hook `useDynamicPricing` est au cœur du système :

```jsx
const { pricing, loading, error } = useDynamicPricing(
  vehicle?.id, // ID du véhicule
  reservationData.startDate, // Date de début
  reservationData.endDate, // Date de fin
  options, // Options sélectionnées
);
```

#### Fonctionnement Interne du Hook

**Fichier : `frontend/src/hooks/usePricing.js`**

```jsx
export const useDynamicPricing = (
  vehicleId,
  startDate,
  endDate,
  options = {},
) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Condition de déclenchement : tous les paramètres obligatoires présents
    if (!vehicleId || !startDate || !endDate) {
      setPricing(null);
      return;
    }

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      setError("Dates invalides");
      return;
    }

    const fetchPricing = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        // Appel API POST /api/pricing/calculate
        const response = await axios.post(
          `${API_URL}/pricing/calculate`,
          {
            vehicle_id: vehicleId,
            start_date: startDate,
            end_date: endDate,
            options: options,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (response.data.success) {
          setPricing(response.data.data); // Sauvegarde du breakdown
        } else {
          setError(response.data.message || "Erreur lors du calcul du prix");
        }
      } catch (err) {
        console.error("Pricing calculation error:", err);
        setError(
          err.response?.data?.message || "Impossible de calculer le prix",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [vehicleId, startDate, endDate, JSON.stringify(options)]);

  return { pricing, loading, error };
};
```

**Points clés :**

- ✅ **Réactivité** : Le hook se déclenche automatiquement quand vehicleId, dates ou options changent
- ✅ **Validation** : Vérifie que les dates sont valides avant l'appel API
- ✅ **Gestion d'erreurs** : Capture et expose les erreurs au composant
- ✅ **Loading state** : Permet d'afficher un spinner pendant le calcul
- ✅ **Authentication** : Envoie le token Sanctum si disponible (pour score de fidélité)

### 3. Affichage des Options de Tarification

Le composant affiche 5 sections d'options **seulement si les dates sont sélectionnées** :

```jsx
{reservationData.startDate && reservationData.endDate && (
  <>
    {/* 1. Assurance & Protection */}
    <div>
      <h4>Assurance & Protection</h4>
      <label>
        <input
          type="checkbox"
          checked={options.full_insurance}
          onChange={(e) => handleOptionChange('full_insurance', e.target.checked)}
        />
        Assurance complète (+15% du sous-total)
      </label>
    </div>

    {/* 2. Équipements */}
    <div>
      <h4>Équipements</h4>
      <label>
        <input type="checkbox" checked={options.gps} ... />
        GPS (5 DT/jour)
      </label>
      <label>
        <input type="checkbox" checked={options.child_seat} ... />
        Siège enfant (3 DT/jour)
      </label>
      <label>
        <input type="checkbox" checked={options.additional_driver} ... />
        Conducteur supplémentaire (8 DT/jour)
      </label>
    </div>

    {/* 3. Services supplémentaires */}
    <div>
      <h4>Services supplémentaires</h4>
      <label>
        <input type="checkbox" checked={options.airport_delivery} ... />
        Livraison aéroport (10 DT unique)
      </label>
      <label>
        <input type="checkbox" checked={options.home_delivery} ... />
        Livraison à domicile (25 DT unique)
      </label>
      <label>
        <input type="checkbox" checked={options.after_hours_pickup} ... />
        Prise en charge hors horaires (15 DT unique)
      </label>
    </div>

    {/* 4. Plan kilométrage */}
    <div>
      <h4>Plan kilométrage</h4>
      <select
        value={options.mileage_option}
        onChange={(e) => handleOptionChange('mileage_option', e.target.value)}
      >
        <option value="100km">100 km/jour (-5%)</option>
        <option value="200km">200 km/jour (prix de base)</option>
        <option value="unlimited">Kilométrage illimité (+10%)</option>
      </select>
    </div>

    {/* 5. Affichage du prix dynamique */}
    {pricingLoading && <Spinner />}
    {pricingError && <ErrorMessage>{pricingError}</ErrorMessage>}
    {pricing && <PriceBreakdown pricing={pricing} compact={false} />}
  </>
)}
```

**Pourquoi conditionnel ?**

- Les options n'ont de sens que si une période est définie
- Évite les appels API inutiles au chargement du modal
- Meilleure UX : l'utilisateur choisit d'abord les dates, puis personnalise

### 4. Gestion des Changements d'Options

```jsx
const handleOptionChange = (option, value) => {
  setOptions((prev) => ({ ...prev, [option]: value }));
};
```

**Ce qui se passe lors d'un changement :**

1. **User clique** sur "GPS" checkbox
2. **handleOptionChange('gps', true)** est appelé
3. **State `options`** est mis à jour : `{ ...options, gps: true }`
4. **useDynamicPricing** détecte le changement via `useEffect` dependencies
5. **Nouvelle requête API** POST /api/pricing/calculate est envoyée
6. **Backend recalcule** avec GPS = 5 DT/jour × nombre de jours
7. **PriceBreakdown** affiche le nouveau prix avec ajustement GPS visible

**Optimisation :**

- Le hook utilise `JSON.stringify(options)` dans les dependencies pour détecter les changements profonds
- Pas de debouncing nécessaire car les changements sont explicites (pas de saisie texte)

### 5. Composant PriceBreakdown

**Fichier : `frontend/src/components/PriceBreakdown.jsx`**

Le composant affiche le résultat du calcul de pricing :

```jsx
<PriceBreakdown pricing={pricing} compact={false} />
```

**Structure du prop `pricing` (retourné par l'API) :**

```javascript
{
  base_price: 150.00,           // Prix de base journalier du véhicule
  rental_days: 7,               // Nombre de jours calculé
  subtotal: 1050.00,            // base_price × rental_days
  adjustments: [
    {
      type: 'seasonal',
      label: 'Haute saison (+25%)',
      multiplier: 1.25,
      amount: 262.50
    },
    {
      type: 'duration',
      label: 'Réduction durée (7 jours)',
      percentage: 10,
      amount: -131.25
    },
    {
      type: 'equipment',
      label: 'GPS',
      amount: 35.00              // 5 DT × 7 jours
    },
    {
      type: 'insurance',
      label: 'Assurance complète',
      percentage: 15,
      amount: 180.00
    },
    // ... autres ajustements
  ],
  total: 1396.25,               // Prix final TTC
  average_daily_rate: 199.46    // total / rental_days
}
```

**Affichage par PriceBreakdown :**

- **Header** : Total en grand avec badge "Prix garanti"
- **Summary** : Indicateurs visuels (économies en vert, suppléments en orange)
- **Base price** : `150 DT × 7 jours = 1050 DT`
- **Ajustements** : Liste déroulante avec couleurs selon type
  - Vert : Réductions (durée, anticipée, fidélité)
  - Orange : Suppléments (saison, weekend, options)
- **Total final** : Avec texte "Aucun frais caché"
- **Footer** : Note sur application séquentielle

**Mode compact :**

```jsx
<PriceBreakdown pricing={pricing} compact={true} />
```

- Ajustements masqués par défaut
- Bouton "Voir les détails" pour déplier

### 6. Soumission de la Réservation

Lorsque l'utilisateur clique sur "Réserver", le breakdown complet est inclus :

```jsx
const handleSubmit = (e) => {
  e.preventDefault();

  // Création de l'objet de soumission avec pricing
  const submissionData = {
    // Informations client
    startDate: reservationData.startDate,
    endDate: reservationData.endDate,
    fullName: reservationData.fullName,
    email: reservationData.email,
    phone: reservationData.phone,

    // Options sélectionnées
    options: options,

    // Breakdown complet du pricing (à sauvegarder en JSON)
    pricing_breakdown: pricing,

    // Prix total (pour référence rapide)
    total_price: pricing?.total || 0,
  };

  // Envoi au parent (VehicleDetails.jsx ou autre)
  onSubmit(submissionData);

  // Reset du formulaire
  // ...
};
```

**Pourquoi inclure `pricing_breakdown` ?**

- ✅ **Transparence** : Le client et l'agence peuvent voir exactement comment le prix a été calculé
- ✅ **Audit** : Traçabilité des ajustements appliqués à cette réservation spécifique
- ✅ **Garantie** : Le prix calculé au moment de la réservation est garanti (ne change pas si les règles évoluent)
- ✅ **Support client** : En cas de litige, le breakdown permet de justifier le prix

### 7. Validation du Formulaire

Le bouton de soumission est désactivé tant que le formulaire n'est pas valide :

```jsx
const isFormValid =
  reservationData.startDate &&
  reservationData.endDate &&
  reservationData.fullName.trim() &&
  reservationData.email.trim() &&
  reservationData.phone.trim() &&
  pricing && // Pricing calculé avec succès
  !pricingLoading && // Calcul terminé
  !pricingError; // Pas d'erreur

<button
  type="submit"
  disabled={!isFormValid}
  className={isFormValid ? "enabled-style" : "disabled-style"}
>
  {pricingLoading
    ? "Calcul en cours..."
    : pricing
      ? `Réserver pour ${pricing.total.toFixed(2)} DT`
      : "Confirmer la réservation"}
</button>;
```

**États du bouton :**

1. **Désactivé (avant dates)** : "Confirmer la réservation"
2. **Désactivé (calcul en cours)** : "Calcul en cours..." avec spinner
3. **Activé (pricing OK)** : "Réserver pour 1396.25 DT"
4. **Désactivé (erreur)** : Bouton grisé + message d'erreur affiché

---

## Backend : Sauvegarde du Breakdown

### Migration de la Base de Données

**Fichier à créer : `database/migrations/XXXX_add_pricing_details_to_reservations.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Sauvegarde du breakdown complet en JSON
            $table->json('pricing_details')->nullable()->after('total_price');

            // Indexation pour recherches futures
            $table->index('total_price');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('pricing_details');
            $table->dropIndex(['total_price']);
        });
    }
};
```

### Contrôleur de Réservation

**Fichier : `backend/app/Http/Controllers/Api/ReservationController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'fullName' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'options' => 'nullable|array',
            'pricing_breakdown' => 'required|array',  // Le breakdown frontend
            'total_price' => 'required|numeric|min:0',
        ]);

        // Sécurité : Recalculer le prix côté backend
        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
        $serverPricing = $this->pricingService->calculatePrice(
            $vehicle,
            Carbon::parse($validated['start_date']),
            Carbon::parse($validated['end_date']),
            auth()->user()->reliability_score ?? null,
            $validated['options'] ?? []
        );

        // Vérification : Le prix frontend correspond au prix backend
        if (abs($serverPricing['total'] - $validated['total_price']) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Le prix a changé. Veuillez recalculer.',
                'expected_price' => $serverPricing['total']
            ], 400);
        }

        // Création de la réservation
        $reservation = Reservation::create([
            'user_id' => auth()->id(),
            'vehicle_id' => $validated['vehicle_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_price' => $serverPricing['total'],
            'pricing_details' => json_encode($serverPricing),  // Sauvegarde du breakdown
            'status' => 'pending',
            'customer_name' => $validated['fullName'],
            'customer_email' => $validated['email'],
            'customer_phone' => $validated['phone'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réservation créée avec succès',
            'reservation' => $reservation
        ], 201);
    }

    public function show($id)
    {
        $reservation = Reservation::with('vehicle', 'user')->findOrFail($id);

        // Décoder le breakdown pour l'affichage
        $pricingDetails = json_decode($reservation->pricing_details, true);

        return response()->json([
            'success' => true,
            'reservation' => $reservation,
            'pricing_breakdown' => $pricingDetails
        ]);
    }
}
```

**Points de sécurité :**

1. ✅ **Double validation** : Le prix est recalculé côté backend pour éviter la manipulation
2. ✅ **Comparaison** : Si le prix frontend ≠ prix backend, la réservation est refusée
3. ✅ **Sauvegarde serveur** : C'est le breakdown backend qui est sauvegardé (pas celui du frontend)
4. ✅ **Token requis** : Route protégée par `auth:sanctum`

---

## Affichage du Breakdown dans l'Historique

### Dans le Dashboard Client

**Fichier : `frontend/src/pages/Dashboard.jsx`**

```jsx
import PriceBreakdown from "../components/PriceBreakdown";

// Dans la section "Historique" ou "Mes Réservations"
{
  reservations.map((reservation) => (
    <div key={reservation.id} className="reservation-card">
      <h3>{reservation.vehicle.name}</h3>
      <p>
        {reservation.start_date} → {reservation.end_date}
      </p>

      {/* Affichage du breakdown sauvegardé */}
      {reservation.pricing_breakdown && (
        <PriceBreakdown
          pricing={reservation.pricing_breakdown}
          compact={true} // Mode compact pour liste
        />
      )}
    </div>
  ));
}
```

---

## Gestion des Cas Limites

### 1. Dates Invalides

```jsx
// Dans useDynamicPricing hook
const start = new Date(startDate);
const end = new Date(endDate);

if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  setError("Dates invalides");
  return;
}

if (start >= end) {
  setError("La date de fin doit être après la date de début");
  return;
}
```

### 2. Véhicule Non Disponible

```jsx
// Backend validation
$existingReservations = Reservation::where('vehicle_id', $vehicleId)
    ->where('status', '!=', 'cancelled')
    ->where(function ($query) use ($startDate, $endDate) {
        $query->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($q) use ($startDate, $endDate) {
                  $q->where('start_date', '<=', $startDate)
                    ->where('end_date', '>=', $endDate);
              });
    })
    ->exists();

if ($existingReservations) {
    return response()->json([
        'success' => false,
        'message' => 'Véhicule non disponible pour ces dates'
    ], 409);
}
```

### 3. Erreur Réseau

```jsx
// Dans ReservationModal
{
  pricingError && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 text-sm">⚠️ {pricingError}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-red-600 underline text-sm mt-2"
      >
        Réessayer
      </button>
    </div>
  );
}
```

### 4. Score de Fidélité Manquant

```jsx
// Backend - PricingController
$reliabilityScore = null;
if (auth()->check()) {
    $user = auth()->user();
    if ($user->clientReliabilityScore) {
        $reliabilityScore = $user->clientReliabilityScore->score;
    }
}

// Si pas de score → pas de réduction fidélité (règle neutre)
```

---

## Tests de l'Intégration

### Test E2E avec Cypress

```javascript
// cypress/e2e/reservation-pricing.cy.js

describe("Reservation with Dynamic Pricing", () => {
  beforeEach(() => {
    cy.login(); // Helper pour authentification
    cy.visit("/vehicles/1"); // Page véhicule
  });

  it("should calculate price dynamically when dates change", () => {
    // Ouvrir modal
    cy.get('[data-testid="reserve-btn"]').click();

    // Sélectionner dates
    cy.get('input[name="startDate"]').type("2026-07-15");
    cy.get('input[name="endDate"]').type("2026-07-22");

    // Vérifier que le calcul est déclenché
    cy.contains("Calcul en cours...").should("be.visible");

    // Attendre le résultat
    cy.contains("Prix garanti", { timeout: 5000 }).should("be.visible");

    // Vérifier que le total est affiché
    cy.get('[data-testid="total-price"]').should("contain", "DT");
  });

  it("should update price when options are toggled", () => {
    cy.get('input[name="startDate"]').type("2026-07-15");
    cy.get('input[name="endDate"]').type("2026-07-22");

    // Attendre pricing initial
    cy.wait(2000);

    // Capturer prix initial
    cy.get('[data-testid="total-price"]')
      .invoke("text")
      .then((initialPrice) => {
        // Activer GPS
        cy.get('input[type="checkbox"][value="gps"]').check();

        // Attendre recalcul
        cy.wait(2000);

        // Vérifier que le prix a changé
        cy.get('[data-testid="total-price"]')
          .invoke("text")
          .should("not.equal", initialPrice);
      });
  });

  it("should submit reservation with pricing breakdown", () => {
    cy.get('input[name="startDate"]').type("2026-07-15");
    cy.get('input[name="endDate"]').type("2026-07-22");
    cy.get('input[name="fullName"]').type("John Doe");
    cy.get('input[name="email"]').type("john@example.com");
    cy.get('input[name="phone"]').type("12345678");

    // Activer options
    cy.get('input[type="checkbox"][value="gps"]').check();
    cy.get('select[name="mileage_option"]').select("unlimited");

    // Soumettre
    cy.intercept("POST", "/api/reservations").as("createReservation");
    cy.get('[type="submit"]').click();

    // Vérifier que pricing_breakdown est envoyé
    cy.wait("@createReservation")
      .its("request.body")
      .should("have.property", "pricing_breakdown");
  });
});
```

---

## Performance et Optimisation

### 1. Debouncing (Non Nécessaire)

- Les options sont des checkboxes/select → changements explicites
- Pas de saisie texte continue → pas besoin de debounce
- Chaque changement doit déclencher un recalcul immédiat

### 2. Caching Côté Backend

```php
// Dans PricingService
use Illuminate\Support\Facades\Cache;

public function getSeasonalMultiplier(Carbon $date): float
{
    $cacheKey = 'seasonal_multiplier_' . $date->format('m');

    return Cache::remember($cacheKey, 3600, function () use ($date) {
        $month = $date->month;
        // ... logique existante
    });
}
```

### 3. Lazy Loading du Modal

```jsx
// Dans VehicleDetails.jsx
import { lazy, Suspense } from 'react';

const ReservationModal = lazy(() => import('../components/ReservationModal'));

// Usage
<Suspense fallback={<div>Chargement...</div>}>
  <ReservationModal isOpen={isOpen} ... />
</Suspense>
```

---

## Documentation Utilisateur

### Message d'Aide dans le Modal

```jsx
{/* Après le formulaire d'options */}
<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
  <div className="flex items-start gap-3">
    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" ...>
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="text-sm text-blue-800">
      <p className="font-semibold mb-1">Comment fonctionne le prix ?</p>
      <p className="text-blue-700">
        Le prix est calculé automatiquement selon 9 règles professionnelles :
        saison, durée, anticipation, options, etc.
        <a href="/terms" className="underline ml-1">Voir les détails</a>
      </p>
    </div>
  </div>
</div>
```

---

## Checklist d'Intégration

### Frontend ✅

- [x] Import de `useDynamicPricing` et `PriceBreakdown`
- [x] État `options` avec toutes les 9 options
- [x] Déclenchement conditionnel (après sélection dates)
- [x] Affichage des 5 sections d'options
- [x] Gestion du loading state
- [x] Gestion des erreurs
- [x] Validation du formulaire
- [x] Inclusion du breakdown dans la soumission
- [x] Bouton désactivé si pricing non calculé

### Backend ✅

- [x] PricingService.php créé
- [x] PricingController.php créé
- [x] Route POST /api/pricing/calculate
- [x] Validation des inputs
- [x] Recalcul serveur pour sécurité
- [ ] Migration `pricing_details` column (à créer)
- [ ] ReservationController::store() mis à jour (à créer/modifier)
- [ ] Tests unitaires backend

### Testing ⏳

- [ ] Tests E2E Cypress
- [ ] Tests unitaires composant
- [ ] Test intégration API
- [ ] Test cas limites (dates invalides, véhicule indisponible)

### Documentation ✅

- [x] RESERVATION_PRICING_INTEGRATION.md
- [x] Diagramme de flux
- [x] Exemples de code
- [x] Guide de tests

---

## Conclusion

L'intégration du système de tarification dynamique dans `ReservationModal` offre :

✅ **Transparence totale** : Le client voit exactement comment le prix est calculé  
✅ **Temps réel** : Le prix se met à jour instantanément quand les options changent  
✅ **Sécurité** : Double validation frontend/backend empêche la manipulation  
✅ **Traçabilité** : Le breakdown complet est sauvegardé avec chaque réservation  
✅ **UX fluide** : Loading states, gestion d'erreurs, validation claire

**Prochaines étapes :**

1. Créer la migration `pricing_details`
2. Implémenter `ReservationController::store()`
3. Ajouter tests E2E
4. Déployer et monitorer les premiers usages

---

**Dernière mise à jour :** 23 février 2026  
**Auteur :** Elite Drive Development Team  
**Version :** 1.0
