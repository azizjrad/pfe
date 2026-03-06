<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users for reported_by_user_id
        $users = User::all();

        if ($users->isEmpty()) {
            echo "⚠️  No users found. Please run UserSeeder first.\n";
            return;
        }

        $reports = [
            [
                'report_type' => 'vehicle',
                'target_id' => 1,
                'target_name' => 'Mercedes-Benz Classe E',
                'reason' => 'Informations incorrectes',
                'description' => 'Le véhicule affiché a des spécifications qui ne correspondent pas à la réalité. Le kilométrage indiqué est faux.',
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Jean Dupont',
                'status' => 'pending',
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'report_type' => 'agency',
                'target_id' => 1,
                'target_name' => 'Elite Drive Centre-Ville',
                'reason' => 'Service client médiocre',
                'description' => "L'agence ne répond pas aux appels téléphoniques et ignore les emails. Service très décevant.",
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Marie Martin',
                'status' => 'pending',
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'report_type' => 'client',
                'target_id' => 5,
                'target_name' => 'Pierre Dubois',
                'reason' => 'Dommages au véhicule',
                'description' => 'Le client a rendu le véhicule avec des rayures importantes sur la portière droite sans les signaler.',
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Elite Drive La Marsa',
                'status' => 'pending',
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'report_type' => 'vehicle',
                'target_id' => 4,
                'target_name' => 'Range Rover Sport',
                'reason' => 'État du véhicule non conforme',
                'description' => "Le véhicule était sale à l'intérieur et sentait la cigarette, malgré l'interdiction de fumer.",
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Sophie Leroux',
                'status' => 'resolved',
                'admin_notes' => 'Véhicule nettoyé en profondeur. Client remboursé partiellement.',
                'resolved_at' => Carbon::now()->subDays(5),
                'created_at' => Carbon::now()->subDays(10),
            ],
            [
                'report_type' => 'agency',
                'target_id' => 2,
                'target_name' => 'Elite Drive La Marsa',
                'reason' => 'Pratiques commerciales douteuses',
                'description' => "L'agence a facturé des frais supplémentaires non mentionnés lors de la réservation.",
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Thomas Bernard',
                'status' => 'dismissed',
                'admin_notes' => 'Après vérification, les frais étaient justifiés et mentionnés dans les conditions générales.',
                'resolved_at' => Carbon::now()->subDays(10),
                'created_at' => Carbon::now()->subDays(15),
            ],
            [
                'report_type' => 'vehicle',
                'target_id' => 2,
                'target_name' => 'BMW Série 7',
                'reason' => 'Photos trompeuses',
                'description' => 'Les photos du véhicule sur le site ne correspondent pas à la réalité. La voiture a des défauts visibles non montrés.',
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Karim Ben Ali',
                'status' => 'pending',
                'created_at' => Carbon::now()->subDays(3),
            ],
            [
                'report_type' => 'client',
                'target_id' => 8,
                'target_name' => 'Fatima Zahra',
                'reason' => 'Retard excessif',
                'description' => 'Le client a rendu le véhicule avec 5 jours de retard sans notification préalable.',
                'reported_by_user_id' => $users->random()->id,
                'reported_by_name' => 'Elite Drive Centre-Ville',
                'status' => 'resolved',
                'admin_notes' => 'Client facturé pour les jours de retard. Pénalité appliquée.',
                'resolved_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(7),
            ],
        ];

        foreach ($reports as $reportData) {
            Report::create($reportData);
        }

        $this->command->info('✅ ' . count($reports) . ' reports created successfully');
    }
}
