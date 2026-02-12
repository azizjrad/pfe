<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Économique',
                'description' => 'Véhicules compacts et économiques, parfaits pour la ville. Consommation réduite.',
            ],
            [
                'name' => 'Berline',
                'description' => 'Voitures confortables pour les longs trajets. Idéales pour les familles.',
            ],
            [
                'name' => 'SUV',
                'description' => 'Véhicules spacieux avec 5-7 places. Parfaits pour les familles et voyages.',
            ],
            [
                'name' => 'Luxe',
                'description' => 'Véhicules haut de gamme avec équipements premium. Confort maximum.',
            ],
            [
                'name' => 'Utilitaire',
                'description' => 'Véhicules pour transport de marchandises. Grande capacité de chargement.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
