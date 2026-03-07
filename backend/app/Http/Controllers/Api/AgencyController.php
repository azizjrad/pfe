<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Reservation;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    /**
     * Get statistics for the authenticated agency admin's agency
     */
    public function getStats(Request $request)
    {
        $user = $request->user();
        $agencyId = $user->agency_id;

        if (!$agencyId) {
            return response()->json(['success' => false, 'message' => 'Aucune agence associée'], 400);
        }

        $totalVehicles      = Vehicle::where('agency_id', $agencyId)->count();
        $availableVehicles  = Vehicle::where('agency_id', $agencyId)->where('status', 'available')->count();
        $maintenanceVehicles = Vehicle::where('agency_id', $agencyId)->where('status', 'maintenance')->count();

        $activeReservations = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        $monthlyRevenue = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))
            ->whereIn('status', ['confirmed', 'ongoing', 'completed'])
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('agency_payout');

        // Overdue: ongoing past end_date
        $overdueReservations = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))
            ->where('status', 'ongoing')
            ->where('end_date', '<', now())
            ->count();

        $alertsCount = $maintenanceVehicles + $overdueReservations;

        return response()->json([
            'success' => true,
            'data'    => [
                'totalVehicles'       => $totalVehicles,
                'availableVehicles'   => $availableVehicles,
                'maintenanceVehicles' => $maintenanceVehicles,
                'activeReservations'  => $activeReservations,
                'monthlyRevenue'      => round($monthlyRevenue, 2),
                'alertsCount'         => $alertsCount,
            ],
        ]);
    }

    /**
     * Get 6-month financial statistics for the authenticated agency
     */
    public function getFinancialStats(Request $request)
    {
        $user     = $request->user();
        $agencyId = $user->agency_id;

        if (!$agencyId) {
            return response()->json(['success' => false, 'message' => 'Aucune agence associée'], 400);
        }

        // Last 6 months monthly breakdown
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $startDate = now()->subMonths($i)->startOfMonth();
            $endDate   = now()->subMonths($i)->endOfMonth();

            $reservations = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereIn('status', ['confirmed', 'ongoing', 'completed'])
                ->get();

            $revenue    = $reservations->sum('total_amount');
            $commission = $reservations->sum('platform_commission');
            $payout     = $reservations->sum('agency_payout');

            $monthlyData[] = [
                'month'      => $startDate->locale('fr')->isoFormat('MMM'),
                'revenue'    => round($revenue, 2),
                'commission' => round($commission, 2),
                'profit'     => round($payout, 2), // agency net = payout
            ];
        }

        // Top 5 vehicles by revenue
        $vehiclePerformance = Vehicle::where('agency_id', $agencyId)
            ->get()
            ->map(function ($vehicle) {
                $reservations = Reservation::where('vehicle_id', $vehicle->id)
                    ->whereIn('status', ['confirmed', 'ongoing', 'completed'])
                    ->get();

                return [
                    'vehicle'  => $vehicle->brand . ' ' . $vehicle->model,
                    'revenue'  => round($reservations->sum('total_amount'), 2),
                    'bookings' => $reservations->count(),
                ];
            })
            ->filter(fn($v) => $v['bookings'] > 0)
            ->sortByDesc('revenue')
            ->take(5)
            ->values();

        // Payment status distribution
        $total = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))->count();

        if ($total > 0) {
            $paid    = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))->where('payment_status', 'paid')->count();
            $pending = Reservation::whereHas('vehicle', fn($q) => $q->where('agency_id', $agencyId))->where('payment_status', 'pending')->count();
            $overdue = $total - $paid - $pending;

            $paymentStatus = [
                ['name' => 'Payé',       'value' => round($paid / $total * 100, 1),    'color' => '#10B981'],
                ['name' => 'En attente', 'value' => round($pending / $total * 100, 1), 'color' => '#F59E0B'],
                ['name' => 'Retard',     'value' => round($overdue / $total * 100, 1), 'color' => '#EF4444'],
            ];
        } else {
            $paymentStatus = [
                ['name' => 'Payé',       'value' => 0, 'color' => '#10B981'],
                ['name' => 'En attente', 'value' => 0, 'color' => '#F59E0B'],
                ['name' => 'Retard',     'value' => 0, 'color' => '#EF4444'],
            ];
        }

        $totalRevenue    = collect($monthlyData)->sum('revenue');
        $totalCommission = collect($monthlyData)->sum('commission');
        $totalPayout     = collect($monthlyData)->sum('profit');

        return response()->json([
            'success' => true,
            'data'    => [
                'monthly'            => $monthlyData,
                'vehiclePerformance' => $vehiclePerformance,
                'paymentStatus'      => $paymentStatus,
                'totals'             => [
                    'revenue'    => round($totalRevenue, 2),
                    'commission' => round($totalCommission, 2),
                    'payout'     => round($totalPayout, 2),
                    'netIncome'  => round($totalPayout, 2),
                ],
            ],
        ]);
    }
}
