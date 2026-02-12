<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders dans l'ordre des dépendances de clés étrangères
        $this->call([
            AgencySeeder::class,           // 1. Créer les agences
            CategorySeeder::class,         // 2. Créer les catégories
            UserSeeder::class,             // 3. Créer les utilisateurs (dépend des agences)
            VehicleSeeder::class,          // 4. Créer les véhicules (dépend des agences et catégories)
            ReservationSeeder::class,      // 5. Créer les réservations (dépend des users et vehicles)
            PaymentSeeder::class,          // 6. Créer les paiements (dépend des réservations)
            VehicleReturnSeeder::class,    // 7. Créer les retours (dépend des réservations)
            ClientReliabilityScoreSeeder::class, // 8. Créer les scores clients (dépend des users)
            PricingRuleSeeder::class,      // 9. Créer les règles de tarification
        ]);
    }
}
