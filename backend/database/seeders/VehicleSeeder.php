<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\Agency;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        // Remove existing vehicles and related prices so we fully replace old entries
        // Disable foreign key checks to allow truncation when related records exist
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        if (Schema::hasTable('vehicle_prices')) {
            DB::table('vehicle_prices')->truncate();
        }
        if (Schema::hasTable('vehicles')) {
            DB::table('vehicles')->truncate();
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Remove any existing agency named 'Agence Tunis Centre' and recreate it fresh
        $oldAgency = Agency::where('name', 'Agence Tunis Centre')->first();
        if ($oldAgency) {
            // Create a temporary replacement agency so we can reassign users (avoids FK/check problems)
            $tempAgency = Agency::create([
                'name' => 'Agence Tunis Centre (recreated)',
                'address' => 'Tunis',
                'city' => 'Tunis',
                'phone' => '+21600000000',
                // use a temporary unique email to avoid unique constraint conflict
                'email' => 'agence.tunis+recreated@example.com',
                'opening_time' => '08:00',
                'closing_time' => '18:00',
                'status' => 'active',
            ]);

            // Reassign users from old agency to the temp agency
            if (Schema::hasTable('users')) {
                DB::table('users')->where('agency_id', $oldAgency->id)->update(['agency_id' => $tempAgency->id]);
            }

            // Delete the old agency and then rename the temp agency to the intended name
            $oldAgency->delete();
            $tempAgency->name = 'Agence Tunis Centre';
            $tempAgency->email = 'agence.tunis@example.com';
            $tempAgency->save();
            $agency = $tempAgency;
        } else {
            $agency = Agency::create([
                'name' => 'Agence Tunis Centre',
                'address' => 'Tunis',
                'city' => 'Tunis',
                'phone' => '+21600000000',
                'email' => 'agence.tunis@example.com',
                'opening_time' => '08:00',
                'closing_time' => '18:00',
                'status' => 'active',
            ]);
        }

        $cars = [
            ['brand' => 'Peugeot', 'model' => '208', 'image' => '/vehicles/208.png', 'src_image' => '../frontend/public/208.png', 'year' => 2020, 'mileage' => 42000, 'license_plate' => 'TN-208-001', 'color' => 'Blanc', 'seats' => 5, 'transmission' => 'manual', 'fuel_type' => 'petrol', 'price' => 80],
            ['brand' => 'Toyota', 'model' => 'Corolla', 'image' => '/vehicles/Corolla.png', 'src_image' => '../frontend/public/Corolla.png', 'year' => 2019, 'mileage' => 56000, 'license_plate' => 'TN-COR-002', 'color' => 'Gris', 'seats' => 5, 'transmission' => 'automatic', 'fuel_type' => 'hybrid', 'price' => 85],
            ['brand' => 'Hyundai', 'model' => 'Tucson', 'image' => '/vehicles/tucson.png', 'src_image' => '../frontend/public/tucson.png', 'year' => 2021, 'mileage' => 30000, 'license_plate' => 'TN-TUC-003', 'color' => 'Bleu', 'seats' => 5, 'transmission' => 'automatic', 'fuel_type' => 'diesel', 'price' => 120],
            ['brand' => 'Renault', 'model' => 'Clio', 'image' => '/vehicles/clio.png', 'src_image' => '../frontend/public/clio.png', 'year' => 2018, 'mileage' => 72000, 'license_plate' => 'TN-CLI-004', 'color' => 'Noir', 'seats' => 5, 'transmission' => 'manual', 'fuel_type' => 'petrol', 'price' => 150],
            ['brand' => 'Mercedes', 'model' => 'Classe C', 'image' => '/vehicles/classe_c.png', 'src_image' => '../frontend/public/classe_c.png', 'year' => 2017, 'mileage' => 88000, 'license_plate' => 'TN-MER-005', 'color' => 'Argent', 'seats' => 5, 'transmission' => 'automatic', 'fuel_type' => 'petrol', 'price' => 180],
            ['brand' => 'Volkswagen', 'model' => 'Passat', 'image' => '/vehicles/passat.png', 'src_image' => '../frontend/public/passat.png', 'year' => 2016, 'mileage' => 95000, 'license_plate' => 'TN-PAS-006', 'color' => 'Blanc', 'seats' => 5, 'transmission' => 'automatic', 'fuel_type' => 'diesel', 'price' => 160],
            ['brand' => 'Toyota', 'model' => 'RAV4', 'image' => '/vehicles/rav4.png', 'src_image' => '../frontend/public/rav4.png', 'year' => 2022, 'mileage' => 15000, 'license_plate' => 'TN-RAV-007', 'color' => 'Vert', 'seats' => 5, 'transmission' => 'automatic', 'fuel_type' => 'hybrid', 'price' => 300],
        ];

        // Ensure backend public/vehicles dir exists and is emptied so old images are removed
        $vehiclesPublicDir = public_path('vehicles');
        if (! is_dir($vehiclesPublicDir)) {
            mkdir($vehiclesPublicDir, 0755, true);
        } else {
            // remove existing files in the folder
            $files = glob($vehiclesPublicDir . DIRECTORY_SEPARATOR . '*');
            foreach ($files as $f) {
                if (is_file($f)) {
                    @unlink($f);
                }
            }
        }

        foreach ($cars as $c) {
            // Copy source image from frontend/public to backend/public/vehicles if present
            $src = base_path($c['src_image']);
            $dst = public_path(ltrim($c['image'], '/'));
            if (file_exists($src)) {
                @copy($src, $dst);
            }

            $vehicle = Vehicle::updateOrCreate(
                ['license_plate' => $c['license_plate']],
                [
                    'brand' => $c['brand'],
                    'model' => $c['model'],
                    'year' => $c['year'],
                    'mileage' => $c['mileage'],
                    'caution_amount' => null,
                    'license_plate' => $c['license_plate'],
                    'color' => $c['color'],
                    'seats' => $c['seats'],
                    'transmission' => $c['transmission'],
                    'fuel_type' => $c['fuel_type'],
                    'status' => 'available',
                    'agency_id' => $agency->id,
                    'images' => [$c['image']],
                ]
            );

            // Optionally create a VehiclePrice record if price provided
            if (! empty($c['price'])) {
                // Use existing VehiclePrice model if available
                if (class_exists(\App\Models\VehiclePrice::class)) {
                    \App\Models\VehiclePrice::updateOrCreate(
                        ['vehicle_id' => $vehicle->id, 'price' => $c['price']],
                        ['start_date' => now()]
                    );
                }
            }
        }
    }
}
