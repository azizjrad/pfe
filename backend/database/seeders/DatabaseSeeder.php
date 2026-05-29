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
        // Add vehicle and agency seeds
        $this->call([
            VehicleSeeder::class,
        ]);
    }
}
