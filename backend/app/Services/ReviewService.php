<?php

namespace App\Services;

use App\Models\Review;
use App\Models\User;

class ReviewService
{
    /**
     * Get all reviews (authorization handled in controller)
     */
    public function getAll($agencyId = null)
    {
        $query = Review::with('agency:id,name')->orderBy('created_at', 'desc');

        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }

        return $query->get();
    }

    /**
     * Create review for agency
     */
    public function create(array $data, $userId, $userName): Review
    {
        $review = Review::create([
            'user_id' => $userId,
            'user_name' => $userName,
            'agency_id' => $data['agency_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        return $review->load('agency');
    }

    /**
     * Delete review
     */
    public function delete(int $id): void
    {
        $review = Review::findOrFail($id);
        $review->delete();
    }

    /**
     * Get reviews written by specific user
     */
    public function getUserReviews(int $userId)
    {
        return Review::with('agency:id,name')
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
    }

    /**
     * Check if user already reviewed this agency
     */
    public function hasReviewed(User $user, int $agencyId): bool
    {
        return Review::where('user_id', $user->id)
            ->where('agency_id', $agencyId)
            ->exists();
    }
}
