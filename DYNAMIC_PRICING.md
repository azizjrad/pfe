# Système de Tarification Dynamique - Elite Drive

## Vue d'ensemble

Le système de tarification dynamique calcule automatiquement le prix final des locations de véhicules en fonction de 9 règles professionnelles. Ce document explique le fonctionnement du système et comment l'utiliser.

## Architecture

### Backend (Laravel)

#### 1. Service de Tarification: `PricingService.php`

Situé dans `backend/app/Services/PricingService.php`, ce service contient toute la logique de calcul de prix.

**Méthode principale:**
```php
public function calculatePrice(
    Vehicle $vehicle,
    Carbon $startDate,
    Carbon $endDate,
    ?int $clientReliabilityScore = null,
    array $options = []
): array
```

**Paramètres:**
- `$vehicle`: Modèle Vehicle avec le prix de base journalier
- `$startDate`: Date de début de location
- `$endDate`: Date de fin de location
- `$clientReliabilityScore`: Score de fiabilité du client (0-100, optionnel)
- `$options`: Array d'options:
  - `full_insurance` (bool): Assurance complète
  - `gps` (bool): GPS
  - `child_seat` (bool): Siège enfant
  - `additional_driver` (bool): Conducteur supplémentaire
  - `airport_delivery` (bool): Livraison aéroport
  - `home_delivery` (bool): Livraison à domicile
  - `after_hours_pickup` (bool): Prise en charge hors horaires
  - `mileage_option` (string): '100km', '200km', ou 'unlimited'

**Retour:**
```php
[
    'base_price' => 150.00,           // Prix de base journalier
    'rental_days' => 7,               // Nombre de jours
    'subtotal' => 1050.00,            // base_price × rental_days
    'adjustments' => [                // Liste des ajustements
        [
            'type' => 'seasonal',
            'label' => 'Haute saison (+25%)',
            'multiplier' => 1.25,
            'amount' => 262.50
        ],
        [
            'type' => 'duration',
            'label' => 'Réduction durée (7 jours)',
            'percentage' => 10,
            'amount' => -131.25
        ],
        // ... plus d'ajustements
    ],
    'total' => 1225.00,              // Prix final TTC
    'average_daily_rate' => 175.00   // Prix moyen par jour
]
```

#### 2. Contrôleur API: `PricingController.php`

Situé dans `backend/app/Http/Controllers/Api/PricingController.php`

**Routes disponibles:**

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/pricing/calculate` | Oui | Calcule le prix pour une réservation spécifique |
| GET | `/api/vehicles/{id}/pricing` | Non | Obtient le prix de base + saison actuelle |
| GET | `/api/pricing/rules` | Non | Obtient toutes les règles de tarification |

**Exemple d'appel - Calcul de prix:**
```bash
POST /api/pricing/calculate
Authorization: Bearer {token}

{
    "vehicle_id": 1,
    "start_date": "2024-07-15",
    "end_date": "2024-07-22",
    "options": {
        "full_insurance": true,
        "gps": true,
        "mileage_option": "unlimited"
    }
}
```

**Réponse:**
```json
{
    "success": true,
    "data": {
        "base_price": 150.00,
        "rental_days": 7,
        "subtotal": 1050.00,
        "adjustments": [...],
        "total": 1425.75,
        "average_daily_rate": 203.68
    }
}
```

## Les 9 Règles de Tarification

### 1. Tarification Saisonnière

Ajuste le prix selon la période de l'année:

| Saison | Mois | Multiplicateur | Ajustement |
|--------|------|----------------|------------|
| Haute saison | Juin-Septembre | 1.25 | +25% |
| Saison des fêtes | Décembre-Janvier | 1.20 | +20% |
| Basse saison | Oct-Nov, Fév-Mars | 0.85 | -15% |
| Saison régulière | Avril-Mai | 1.00 | Base |

**Implémentation:** `getSeasonalMultiplier()`, `getSeasonLabel()`

### 2. Réservation Anticipée

Encourage les réservations précoces:

| Délai de réservation | Réduction |
|----------------------|-----------|
| 30 jours ou plus | -10% |
| 15-29 jours | -5% |
| 7-14 jours | -2% |
| Moins de 2 jours | +15% (dernière minute) |

**Implémentation:** `getAdvanceBookingDiscount()`, `getLastMinutePremium()`

### 3. Durée de Location

Réductions pour les locations longues:

| Durée | Réduction |
|-------|-----------|
| 21 jours ou plus | -20% |
| 14-20 jours | -15% |
| 7-13 jours | -10% |
| 3-6 jours | -5% |
| 1-2 jours | Base |

**Implémentation:** `getDurationDiscount()`

### 4. Supplément Weekend

Majoration pour les locations weekend:

- **+15%** si prise en charge un vendredi, samedi ou dimanche
- Base sinon

**Implémentation:** `getWeekendPremium()`

### 5. Score de Fidélité

Récompense les clients fiables:

| Score | Ajustement |
|-------|------------|
| 90-100% | -5% |
| 75-89% | -2% |
| 60-74% | Base |
| Moins de 60% | +5% (pénalité) |

**Implémentation:** `getLoyaltyDiscount()`

### 6. Disponibilité de la Flotte

Ajustement selon la demande (placeholder actuellement):

| Disponibilité | Ajustement |
|---------------|------------|
| Moins de 20% | +15% (forte demande) |
| 20-60% | Base |
| Plus de 60% | -10% (faible demande) |

**Implémentation:** `getAvailabilityMultiplier()` - À implémenter

**TODO:**
```php
private function getAvailabilityMultiplier(Vehicle $vehicle, Carbon $startDate, Carbon $endDate): float
{
    // Query reservations table for the agency's fleet
    $totalVehicles = Vehicle::where('agency_id', $vehicle->agency_id)->count();
    $reservedVehicles = Reservation::where('agency_id', $vehicle->agency_id)
        ->where(function ($query) use ($startDate, $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate]);
        })
        ->distinct('vehicle_id')
        ->count();
    
    $availabilityRate = ($totalVehicles - $reservedVehicles) / $totalVehicles;
    
    if ($availabilityRate < 0.2) return 1.15; // High demand
    if ($availabilityRate > 0.6) return 0.90; // Low demand
    return 1.0; // Normal
}
```

### 7. Assurances et Équipements

Prix fixes par jour:

| Option | Prix |
|--------|------|
| Assurance complète | +15% du sous-total |
| GPS | 5 DT/jour |
| Siège enfant | 3 DT/jour |
| Conducteur supplémentaire | 8 DT/jour |

### 8. Services Spéciaux

Prix fixes uniques:

| Service | Prix |
|---------|------|
| Livraison aéroport | 10 DT |
| Livraison à domicile | 25 DT |
| Prise en charge hors horaires | 15 DT |

### 9. Options de Kilométrage

Ajustement selon le plan:

| Option | Ajustement |
|--------|------------|
| Kilométrage illimité | +10% |
| 100 km/jour | -5% |
| 200 km/jour | Base |

## Frontend (React)

### 1. Hook personnalisé: `usePricing.js`

Situé dans `frontend/src/hooks/usePricing.js`

**Hooks disponibles:**

#### `useDynamicPricing(vehicleId, startDate, endDate, options)`
Calcule le prix dynamique en temps réel.

```jsx
import { useDynamicPricing } from '../hooks/usePricing';

function ReservationForm() {
  const [options, setOptions] = useState({
    full_insurance: false,
    gps: false,
    mileage_option: '200km'
  });

  const { pricing, loading, error } = useDynamicPricing(
    vehicleId,
    '2024-07-15',
    '2024-07-22',
    options
  );

  if (loading) return <div>Calcul en cours...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return <PriceBreakdown pricing={pricing} />;
}
```

#### `useVehiclePricing(vehicleId)`
Obtient le prix de base + information saisonnière.

```jsx
const { pricing, loading } = useVehiclePricing(vehicleId);

// pricing.data:
// {
//   vehicle_id: 1,
//   base_daily_price: 150.00,
//   current_season: "Haute saison (+25%)",
//   seasonal_multiplier: 1.25,
//   estimated_daily_rate: 187.50,
//   note: "Le prix final peut varier..."
// }
```

#### `usePricingRules()`
Obtient toutes les règles de tarification.

```jsx
const { rules, loading } = usePricingRules();

// Affiche les règles dans une page d'aide ou FAQ
```

### 2. Composant: `PriceBreakdown.jsx`

Situé dans `frontend/src/components/PriceBreakdown.jsx`

Affiche le détail complet de la tarification avec:
- Prix final en grand
- Indicateurs visuels (économies/suppléments)
- Liste détaillée des ajustements
- Mode compact avec dépliage

**Props:**
```jsx
<PriceBreakdown 
  pricing={pricingData}  // Objet retourné par useDynamicPricing
  compact={true}         // Mode compact (défaut: false)
/>
```

**Caractéristiques:**
- ✅ Affichage professionnel avec gradient
- ✅ Ajustements colorés (vert = réduction, orange = supplément)
- ✅ Badge "Prix garanti"
- ✅ Pliable/dépliable en mode compact
- ✅ Responsive

## Intégration dans le Flux de Réservation

### Étape 1: Modifier ReservationModal.jsx

```jsx
import { useState, useEffect } from 'react';
import { useDynamicPricing } from '../hooks/usePricing';
import PriceBreakdown from './PriceBreakdown';

const ReservationModal = ({ vehicle, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    fullName: '',
    email: '',
    phone: ''
  });

  const [options, setOptions] = useState({
    full_insurance: false,
    gps: false,
    child_seat: false,
    additional_driver: false,
    airport_delivery: false,
    home_delivery: false,
    after_hours_pickup: false,
    mileage_option: '200km'
  });

  // Calculer le prix dynamiquement
  const { pricing, loading, error } = useDynamicPricing(
    vehicle.id,
    formData.startDate,
    formData.endDate,
    options
  );

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="modal">
      <h2>Réserver {vehicle.name}</h2>
      
      {/* Formulaire de dates */}
      <div>
        <label>Date de début</label>
        <input 
          type="date" 
          value={formData.startDate}
          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label>Date de fin</label>
        <input 
          type="date" 
          value={formData.endDate}
          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          min={formData.startDate}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.full_insurance}
            onChange={(e) => handleOptionChange('full_insurance', e.target.checked)}
          />
          Assurance complète (+15%)
        </label>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.gps}
            onChange={(e) => handleOptionChange('gps', e.target.checked)}
          />
          GPS (5 DT/jour)
        </label>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.child_seat}
            onChange={(e) => handleOptionChange('child_seat', e.target.checked)}
          />
          Siège enfant (3 DT/jour)
        </label>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.additional_driver}
            onChange={(e) => handleOptionChange('additional_driver', e.target.checked)}
          />
          Conducteur supplémentaire (8 DT/jour)
        </label>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.airport_delivery}
            onChange={(e) => handleOptionChange('airport_delivery', e.target.checked)}
          />
          Livraison aéroport (10 DT)
        </label>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={options.home_delivery}
            onChange={(e) => handleOptionChange('home_delivery', e.target.checked)}
          />
          Livraison à domicile (25 DT)
        </label>
      </div>

      {/* Kilométrage */}
      <div>
        <label>Plan kilométrage</label>
        <select 
          value={options.mileage_option}
          onChange={(e) => handleOptionChange('mileage_option', e.target.value)}
        >
          <option value="100km">100 km/jour (-5%)</option>
          <option value="200km">200 km/jour (base)</option>
          <option value="unlimited">Illimité (+10%)</option>
        </select>
      </div>

      {/* Affichage du prix */}
      {formData.startDate && formData.endDate && (
        <PriceBreakdown pricing={pricing} compact={false} />
      )}

      {/* Informations client */}
      <div>
        <input 
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          placeholder="Nom complet"
        />
      </div>

      {/* Bouton de réservation */}
      <button 
        disabled={!pricing || loading}
        onClick={() => handleReservation({ ...formData, pricing })}
      >
        {loading ? 'Calcul...' : `Réserver pour ${pricing?.total.toFixed(2)} DT`}
      </button>
    </div>
  );
};
```

### Étape 2: Sauvegarder le breakdown dans la réservation

Lors de la création d'une réservation, sauvegarder le détail du prix:

```php
// Backend - ReservationController.php
public function store(Request $request)
{
    $validated = $request->validate([
        'vehicle_id' => 'required|exists:vehicles,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after:start_date',
        'options' => 'nullable|array',
        'pricing_breakdown' => 'required|array', // Le détail du pricing
    ]);

    $reservation = Reservation::create([
        'user_id' => auth()->id(),
        'vehicle_id' => $validated['vehicle_id'],
        'start_date' => $validated['start_date'],
        'end_date' => $validated['end_date'],
        'total_price' => $validated['pricing_breakdown']['total'],
        'pricing_details' => json_encode($validated['pricing_breakdown']), // Sauvegarde JSON
        'status' => 'pending'
    ]);

    return response()->json(['success' => true, 'reservation' => $reservation]);
}
```

**Migration à créer:**
```php
Schema::table('reservations', function (Blueprint $table) {
    $table->json('pricing_details')->nullable();
});
```

## Tests et Scénarios

### Scénarios de Test Recommandés

1. **Haute saison + Weekend + Dernière minute:**
   - Dates: Vendredi 12 juillet 2024 - Dimanche 14 juillet 2024
   - Réservation: Aujourd'hui (< 2 jours)
   - Résultat attendu: +25% (saison) +15% (weekend) +15% (dernière minute) = +55%

2. **Basse saison + Longue durée + Anticipée:**
   - Dates: 1er novembre 2024 - 30 novembre 2024 (30 jours)
   - Réservation: Aujourd'hui (> 30 jours à l'avance)
   - Résultat attendu: -15% (saison) -20% (durée) -10% (anticipée) = -45%

3. **Client fidèle + Assurance complète:**
   - Score client: 95%
   - Options: full_insurance = true
   - Résultat attendu: -5% (fidélité) +15% (assurance)

4. **Toutes les options:**
   - GPS, siège enfant, conducteur supplémentaire, livraison aéroport, kilométrage illimité
   - Vérifier que tous les montants sont corrects

### Tests Unitaires Backend

```php
// tests/Unit/PricingServiceTest.php
public function test_seasonal_pricing_high_season()
{
    $vehicle = Vehicle::factory()->create(['daily_price' => 100]);
    $service = new PricingService();
    
    $result = $service->calculatePrice(
        $vehicle,
        Carbon::parse('2024-07-15'), // Juillet = haute saison
        Carbon::parse('2024-07-16'),
        null,
        []
    );
    
    $seasonalAdj = collect($result['adjustments'])
        ->firstWhere('type', 'seasonal');
    
    $this->assertEquals(25.00, $seasonalAdj['amount']); // 100 * 1.25 = 125, +25 DT
}
```

## Documentation Utilisateur

La documentation complète est disponible pour les utilisateurs dans:
- **frontend/src/pages/TermsOfService.jsx** - Section 3: "Tarification dynamique"

Cette section explique:
- ✅ Toutes les règles avec pourcentages exacts
- ✅ Prix des options et services
- ✅ Avertissement clair pour les agences
- ✅ Garantie du prix calculé

## Checklist d'Implémentation

### Backend ✅
- [x] PricingService.php créé avec 9 règles
- [x] PricingController.php créé
- [x] Routes API ajoutées
- [x] Méthodes publiques getSeasonalMultiplier/getSeasonLabel
- [ ] Implémenter getAvailabilityMultiplier() avec requêtes DB
- [ ] Ajouter colonne pricing_details à la table reservations
- [ ] Modifier ReservationController pour sauvegarder le breakdown
- [ ] Tests unitaires pour chaque règle

### Frontend ✅
- [x] Hook usePricing.js créé
- [x] Composant PriceBreakdown.jsx créé
- [x] Documentation Terms & Conditions mise à jour
- [ ] Intégrer dans ReservationModal.jsx
- [ ] Ajouter options (assurances, équipements, services)
- [ ] Afficher badge saisonnier dans liste véhicules
- [ ] Créer page FAQ avec usePricingRules()
- [ ] Tests E2E pour le flux de réservation

### Documentation ✅
- [x] DYNAMIC_PRICING.md créé
- [x] Explications détaillées des 9 règles
- [x] Exemples d'utilisation frontend
- [x] Scénarios de test
- [ ] Documentation API (Swagger/OpenAPI)

## Performance et Optimisation

### Caching
Considérer le caching pour:
- Règles de pricing (changent rarement)
- Multiplicateurs saisonniers (par mois)
- Disponibilité de la flotte (cache 5-10 min)

```php
// Exemple avec cache Laravel
$rules = Cache::remember('pricing_rules', 3600, function () {
    return PricingService::getRules();
});
```

### Base de données
- Index sur `reservations.start_date` et `end_date` pour calcul disponibilité
- Index sur `vehicles.agency_id` pour requêtes de flotte

## Sécurité

- ✅ Authentification Sanctum requise pour `/api/pricing/calculate`
- ✅ Validation stricte des inputs (dates, options)
- ✅ Prix calculé côté backend (pas de confiance au frontend)
- ✅ Sauvegarde du breakdown pour traçabilité
- ❓ Rate limiting sur les endpoints de pricing (à considérer)

## Support et Questions

Pour toute question sur le système de tarification:
1. Consulter ce document
2. Vérifier les Terms & Conditions (Section 3)
3. Examiner le code de PricingService.php

---

**Dernière mise à jour:** Décembre 2024  
**Version:** 1.0  
**Auteur:** Elite Drive Development Team
