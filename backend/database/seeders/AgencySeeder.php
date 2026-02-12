<?php

namespace Database\Seeders;

use App\Models\Agency;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agencies = [
            [
                'name' => 'Agence Tunis Centre',
                'address' => 'Avenue Habib Bourguiba',
                'city' => 'Tunis',
                'phone' => '+216 71 123 456',
                'email' => 'tunis.centre@location.tn',
                'opening_time' => '08:00',
                'closing_time' => '18:00',
                'status' => 'active',
            ],
            [
                'name' => 'Agence Aéroport Carthage',
                'address' => 'Aéroport International Tunis-Carthage',
                'city' => 'Tunis',
                'phone' => '+216 71 234 567',
                'email' => 'aeroport@location.tn',
                'opening_time' => '06:00',
                'closing_time' => '22:00',
                'status' => 'active',
            ],
            [
                'name' => 'Agence Sousse',
                'address' => 'Boulevard de la Corniche',
                'city' => 'Sousse',
                'phone' => '+216 73 345 678',
                'email' => 'sousse@location.tn',
                'opening_time' => '08:00',
                'closing_time' => '17:00',
                'status' => 'active',
            ],
            [
                'name' => 'Agence Sfax',
                'address' => 'Avenue de la République',
                'city' => 'Sfax',
                'phone' => '+216 74 456 789',
                'email' => 'sfax@location.tn',
                'opening_time' => '08:00',
                'closing_time' => '17:00',
                'status' => 'active',
            ],
            [
                'name' => 'Agence Hammamet',
                'address' => 'Zone Touristique Yasmine',
                'city' => 'Hammamet',
                'phone' => '+216 72 567 890',
                'email' => 'hammamet@location.tn',
                'opening_time' => '09:00',
                'closing_time' => '19:00',
                'status' => 'active',
            ],
        ];

        foreach ($agencies as $agency) {
            Agency::create($agency);
        }
    }
}
