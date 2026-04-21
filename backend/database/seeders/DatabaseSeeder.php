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
        if (app()->environment('production') && !filter_var((string) env('ALLOW_PRODUCTION_SEEDERS', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->warn('Production environment detected. DatabaseSeeder is skipped by default.');
            $this->command?->warn('Use admin:bootstrap for initial admin provisioning.');
            return;
        }

        // Seeders dans l'ordre des dépendances de clés étrangères
        $this->call([
            SuperAdminSeeder::class,       // 0. Créer le super admin (compte plateforme)
            AgencySeeder::class,           // 1. Créer les agences
            CategorySeeder::class,         // 2. Créer les catégories de véhicules
            UserSeeder::class,             // 3. Créer les utilisateurs (dépend des agences)
            VehicleSeeder::class,          // 4. Créer les véhicules (dépend des agences et catégories)
            ReservationSeeder::class,      // 5. Créer les réservations (dépend des users et vehicles)
            PaymentSeeder::class,          // 6. Créer les paiements (dépend des réservations)
            VehicleReturnSeeder::class,    // 7. Créer les retours (dépend des réservations)
            ClientReliabilityScoreSeeder::class, // 8. Créer les scores clients (dépend des users)
            ReportSeeder::class,           // 9. Créer les signalements (dépend des users)
            RealisticDashboardSeeder::class, // 10. Générer des données réalistes pour dashboard
        ]);
    }
}
