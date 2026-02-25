<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get platform-wide statistics for admin dashboard
     */
    public function getDashboardStats()
    {
        $stats = [
            'totalAgencies' => Agency::count(),
            'totalUsers' => User::count(),
            'totalVehicles' => Vehicle::count(),
            'totalReservations' => Reservation::count(),
            'activeReservations' => Reservation::whereIn('status', ['pending', 'confirmed', 'ongoing'])->count(),
            'monthlyRevenue' => Reservation::where('created_at', '>=', now()->startOfMonth())
                ->sum('platform_commission'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all agencies with statistics
     */
    public function getAgencies()
    {
        $agencies = Agency::withCount('vehicles')
            ->get()
            ->map(function ($agency) {
                // Calculate monthly revenue for this agency
                $monthlyRevenue = Reservation::whereHas('vehicle', function ($query) use ($agency) {
                    $query->where('agency_id', $agency->id);
                })
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->sum('agency_payout');

                return [
                    'id' => $agency->id,
                    'name' => $agency->name,
                    'address' => $agency->address,
                    'phone' => $agency->phone,
                    'email' => $agency->email,
                    'vehicles' => $agency->vehicles_count,
                    'revenue' => round($monthlyRevenue, 2),
                    'status' => $agency->status ?? 'active',
                    'created_at' => $agency->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $agencies,
        ]);
    }

    /**
     * Get all users with their details
     */
    public function getUsers()
    {
        $users = User::with('agency:id,name')
            ->withCount('reservations')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'agency' => $user->agency ? $user->agency->name : null,
                    'agency_id' => $user->agency_id,
                    'reservations_count' => $user->reservations_count,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Update agency
     */
    public function updateAgency(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:500',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
        ]);

        $agency = Agency::findOrFail($id);
        $agency->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agence mise à jour avec succès',
            'data' => $agency,
        ]);
    }

    /**
     * Delete agency
     */
    public function deleteAgency($id)
    {
        $agency = Agency::findOrFail($id);

        // Check if agency has vehicles
        if ($agency->vehicles()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une agence avec des véhicules',
            ], 400);
        }

        // Check if agency has users (admins)
        if ($agency->admins()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une agence avec des utilisateurs',
            ], 400);
        }

        $agency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agence supprimée avec succès',
        ]);
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'role' => 'sometimes|in:client,agency_admin,super_admin',
            'agency_id' => 'sometimes|nullable|exists:agencies,id',
        ]);

        $user = User::findOrFail($id);
        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user->load('agency:id,name'),
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting the current admin
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte',
            ], 400);
        }

        // Check if user has active reservations
        $activeReservations = $user->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'ongoing'])
            ->count();

        if ($activeReservations > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un utilisateur avec des réservations actives',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
}
