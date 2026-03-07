<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Agency;
use App\Models\User;
use Carbon\Carbon;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $agencies = Agency::pluck('id')->toArray();
        $clients  = User::where('role', 'client')->pluck('id', 'name')->toArray();

        if (empty($agencies)) {
            $this->command->warn('No agencies found — skipping ReviewSeeder.');
            return;
        }

        $reviews = [
            [
                'user_name' => 'Sophie Martin',
                'rating'    => 5,
                'comment'   => 'Excellent service ! Voiture impeccable et personnel très accueillant. Je recommande vivement cette agence.',
                'days_ago'  => 5,
            ],
            [
                'user_name' => 'Thomas Dubois',
                'rating'    => 4,
                'comment'   => 'Très bonne expérience. La voiture était propre et bien entretenue. Un petit délai à la prise en charge mais rien de grave.',
                'days_ago'  => 10,
            ],
            [
                'user_name' => 'Marie Leclerc',
                'rating'    => 5,
                'comment'   => 'Service irréprochable ! L\'équipe est professionnelle et à l\'écoute. Les prix sont compétitifs.',
                'days_ago'  => 15,
            ],
            [
                'user_name' => 'Pierre Bernard',
                'rating'    => 3,
                'comment'   => 'Agence correcte mais j\'ai trouvé la voiture avec quelques rayures non mentionnées. Le reste était bien.',
                'days_ago'  => 7,
            ],
            [
                'user_name' => 'Julie Rousseau',
                'rating'    => 5,
                'comment'   => 'Parfait ! Personnel sympathique, voiture neuve et propre. Je reviendrai sans hésiter.',
                'days_ago'  => 20,
            ],
            [
                'user_name' => 'Ahmed Ben Ali',
                'rating'    => 4,
                'comment'   => 'Bonne agence, processus rapide. Véhicule conforme à la description.',
                'days_ago'  => 3,
            ],
            [
                'user_name' => 'Fatima Zahra',
                'rating'    => 2,
                'comment'   => 'Déçue par la propreté du véhicule. Le service était correct mais peut mieux faire.',
                'days_ago'  => 12,
            ],
            [
                'user_name' => 'Karim Bouzid',
                'rating'    => 5,
                'comment'   => 'Top ! Réservation simple, voiture en parfait état. Je recommande.',
                'days_ago'  => 1,
            ],
        ];

        $agencyCount = count($agencies);
        foreach ($reviews as $i => $reviewData) {
            $agencyId = $agencies[$i % $agencyCount];

            // Try to find a matching client user
            $userId = null;
            foreach ($clients as $name => $id) {
                if (str_contains($name, explode(' ', $reviewData['user_name'])[0])) {
                    $userId = $id;
                    break;
                }
            }

            Review::create([
                'agency_id'  => $agencyId,
                'user_id'    => $userId,
                'user_name'  => $reviewData['user_name'],
                'rating'     => $reviewData['rating'],
                'comment'    => $reviewData['comment'],
                'created_at' => Carbon::now()->subDays($reviewData['days_ago']),
                'updated_at' => Carbon::now()->subDays($reviewData['days_ago']),
            ]);
        }

        $this->command->info('✅ ' . count($reviews) . ' reviews created successfully');
    }
}
