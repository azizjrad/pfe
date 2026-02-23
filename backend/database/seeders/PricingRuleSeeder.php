<?php

namespace Database\Seeders;

use App\Models\PricingRule;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PricingRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rules = [
            // Haute saison été (Juin-Août)
            [
                'name' => 'Haute saison été',
                'description' => 'Supplément de 25% pendant la période estivale (juin, juillet, août)',
                'rule_type' => 'seasonal',
                'adjustment_type' => 'percentage',
                'adjustment_value' => 25.00,
                'start_date' => Carbon::create(date('Y'), 6, 1)->format('Y-m-d'),
                'end_date' => Carbon::create(date('Y'), 8, 31)->format('Y-m-d'),
                'category_id' => null,
                'agency_id' => null,
                'min_rental_days' => null,
                'max_rental_days' => null,
                'priority' => 1,
                'is_active' => true,
            ],

            // Réduction longue durée
            [
                'name' => 'Réduction location longue durée',
                'description' => 'Réduction de 10% pour les locations de 7 jours ou plus',
                'rule_type' => 'duration',
                'adjustment_type' => 'percentage',
                'adjustment_value' => -10.00,
                'start_date' => null,
                'end_date' => null,
                'category_id' => null,
                'agency_id' => null,
                'min_rental_days' => 7,
                'max_rental_days' => null,
                'priority' => 2,
                'is_active' => true,
            ],

            // Supplément aéroport
            [
                'name' => 'Supplément agence aéroport',
                'description' => 'Frais de service aéroport de 15%',
                'rule_type' => 'agency',
                'adjustment_type' => 'percentage',
                'adjustment_value' => 15.00,
                'start_date' => null,
                'end_date' => null,
                'category_id' => null,
                'agency_id' => 2, // Agence Aéroport Carthage
                'min_rental_days' => null,
                'max_rental_days' => null,
                'priority' => 3,
                'is_active' => true,
            ],

            // Promotion catégorie Luxe
            [
                'name' => 'Promotion véhicules Luxe',
                'description' => 'Réduction de 20% sur la catégorie Luxe pour encourager les locations haut de gamme',
                'rule_type' => 'category',
                'adjustment_type' => 'percentage',
                'adjustment_value' => -20.00,
                'start_date' => Carbon::now()->format('Y-m-d'),
                'end_date' => Carbon::now()->addDays(30)->format('Y-m-d'),
                'category_id' => 4, // Catégorie Luxe
                'agency_id' => null,
                'min_rental_days' => null,
                'max_rental_days' => null,
                'priority' => 4,
                'is_active' => true,
            ],

            // Réduction très longue durée (mensuel)
            [
                'name' => 'Réduction location mensuelle',
                'description' => 'Réduction de 25% pour les locations de 30 jours ou plus',
                'rule_type' => 'duration',
                'adjustment_type' => 'percentage',
                'adjustment_value' => -25.00,
                'start_date' => null,
                'end_date' => null,
                'category_id' => null,
                'agency_id' => null,
                'min_rental_days' => 30,
                'max_rental_days' => null,
                'priority' => 1, // Priorité élevée car meilleur avantage
                'is_active' => true,
            ],

            // Forfait fixe court séjour
            [
                'name' => 'Forfait week-end économique',
                'description' => 'Forfait fixe de 200 DT pour 2-3 jours en catégorie Économique',
                'rule_type' => 'category',
                'adjustment_type' => 'fixed',
                'adjustment_value' => 200.00,
                'start_date' => null,
                'end_date' => null,
                'category_id' => 1, // Catégorie Économique
                'agency_id' => null,
                'min_rental_days' => 2,
                'max_rental_days' => 3,
                'priority' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($rules as $rule) {
            PricingRule::create($rule);
        }
    }
}
