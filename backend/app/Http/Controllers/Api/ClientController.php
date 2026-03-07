<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ClientReliabilityScore;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ClientController extends Controller
{
    /**
     * Get statistics for the authenticated client
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        $activeReservations = Reservation::where('user_id', $userId)
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        $completedReservations = Reservation::where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        $totalSpend = Reservation::where('user_id', $userId)
            ->whereIn('status', ['confirmed', 'ongoing', 'completed'])
            ->sum('total_price');

        $score = ClientReliabilityScore::where('user_id', $userId)->first();
        $reliabilityScore = $score ? $score->reliability_score : 100;
        $riskLevel = $score ? $score->risk_level : 'low';

        $riskLabels = [
            'low'    => 'Excellent',
            'medium' => 'Bon',
            'high'   => 'À surveiller',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'activeReservations'   => $activeReservations,
                'completedReservations' => $completedReservations,
                'totalSpend'           => round($totalSpend, 2),
                'reliabilityScore'     => $reliabilityScore,
                'riskLevel'            => $riskLevel,
                'riskLabel'            => $riskLabels[$riskLevel] ?? 'Bon',
            ],
        ]);
    }

    /**
     * Get notifications derived from recent reservation events
     * Works for agency_admin and client based on role
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        $notifications = [];

        if ($user->role === 'client') {
            $reservations = Reservation::where('user_id', $user->id)
                ->with('vehicle:id,brand,model')
                ->orderBy('updated_at', 'desc')
                ->take(10)
                ->get();

            foreach ($reservations as $r) {
                $vehicleName = $r->vehicle
                    ? $r->vehicle->brand . ' ' . $r->vehicle->model
                    : 'Véhicule';

                $messages = [
                    'confirmed'  => ["Réservation confirmée",  "Votre réservation de {$vehicleName} a été confirmée"],
                    'pending'    => ["Réservation en attente", "Votre réservation de {$vehicleName} attend confirmation"],
                    'ongoing'    => ["Véhicule prêt",          "{$vehicleName} est prêt pour le retrait"],
                    'completed'  => ["Location terminée",      "Votre location de {$vehicleName} est terminée"],
                    'cancelled'  => ["Réservation annulée",    "Votre réservation de {$vehicleName} a été annulée"],
                ];

                [$title, $message] = $messages[$r->status] ?? ["Mise à jour", "Statut mis à jour pour {$vehicleName}"];

                $notifications[] = [
                    'id'         => $r->id,
                    'type'       => $r->status === 'confirmed' || $r->status === 'ongoing' ? 'reservation' : 'vehicle',
                    'title'      => $title,
                    'message'    => $message,
                    'created_at' => $r->updated_at->toISOString(),
                    'is_read'    => $r->updated_at->lt(now()->subHours(2)),
                ];
            }
        } elseif ($user->role === 'agency_admin' && $user->agency_id) {
            $agencyId = $user->agency_id;

            $reservations = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))
                ->with(['vehicle:id,brand,model', 'user:id,name'])
                ->orderBy('updated_at', 'desc')
                ->take(10)
                ->get();

            foreach ($reservations as $r) {
                $vehicleName  = $r->vehicle ? $r->vehicle->brand . ' ' . $r->vehicle->model : 'Véhicule';
                $clientName   = $r->user ? $r->user->name : 'Client';
                $amount       = number_format($r->total_price, 0, '.', ' ');

                $types = [
                    'pending'   => ['reservation', "Nouvelle réservation",     "{$clientName} a réservé un {$vehicleName}"],
                    'confirmed' => ['reservation', "Réservation confirmée",    "{$clientName} - {$vehicleName} confirmé"],
                    'ongoing'   => ['vehicle',     "Véhicule remis",           "{$vehicleName} remis à {$clientName}"],
                    'completed' => ['vehicle',     "Retour de véhicule",       "{$vehicleName} retourné par {$clientName}"],
                    'cancelled' => ['payment',     "Réservation annulée",      "{$clientName} a annulé la réservation {$vehicleName}"],
                ];

                [$type, $title, $message] = $types[$r->status] ?? ['reservation', 'Mise à jour', "{$vehicleName}"];

                $notifications[] = [
                    'id'         => $r->id,
                    'type'       => $type,
                    'title'      => $title,
                    'message'    => $message,
                    'created_at' => $r->updated_at->toISOString(),
                    'is_read'    => $r->updated_at->lt(now()->subHours(2)),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => array_values($notifications),
        ]);
    }
}
