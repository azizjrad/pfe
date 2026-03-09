<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Agency;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get all reviews (super_admin: all agencies, agency_admin: own agency)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Review::with('agency:id,name')->orderBy('created_at', 'desc');

        if ($user->role === 'agency_admin' && $user->agency_id) {
            $query->where('agency_id', $user->agency_id);
        }

        $reviews = $query->get()->map(fn($r) => [
            'id'         => $r->id,
            'agency_id'  => $r->agency_id,
            'agency_name'=> $r->agency?->name,
            'user_id'    => $r->user_id,
            'user_name'  => $r->user_name,
            'rating'     => $r->rating,
            'comment'    => $r->comment,
            'created_at' => $r->created_at->toISOString(),
        ]);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    /**
     * Submit a review (authenticated clients)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agency_id' => 'required|exists:agencies,id',
            'rating'    => 'required|integer|between:1,5',
            'comment'   => 'required|string|max:1000',
        ]);

        $review = Review::create([
            ...$validated,
            'user_id'   => $request->user()->id,
            'user_name' => $request->user()->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Avis publié avec succès',
            'data'    => $review,
        ], 201);
    }

    /**
     * Delete a review (super_admin only)
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json(['success' => true, 'message' => 'Avis supprimé avec succès']);
    }

    /**
     * Get reviews written BY a specific user (for admin viewing user details)
     */
    public function getUserReviews($userId)
    {
        try {
            $reviews = Review::with('agency:id,name')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($r) => [
                    'id'         => $r->id,
                    'agency_id'  => $r->agency_id,
                    'agency_name'=> $r->agency?->name,
                    'user_id'    => $r->user_id,
                    'user_name'  => $r->user_name,
                    'rating'     => $r->rating,
                    'comment'    => $r->comment,
                    'created_at' => $r->created_at->toISOString(),
                ]);

            return response()->json([
                'success' => true,
                'data' => $reviews,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis de l\'utilisateur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
