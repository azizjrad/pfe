<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    private ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Get all reviews (super_admin: all agencies, agency_admin: own agency)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Determine which agency to filter by
        $agencyId = $user->isAgencyAdmin() ? $user->agency_id : null;
        $reviews = $this->reviewService->getAll($agencyId);

        return response()->json(['success' => true, 'data' => ReviewResource::collection($reviews)]);
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

        try {
            $review = $this->reviewService->create(
                $validated,
                $request->user()->id,
                $request->user()->name
            );

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data'    => new ReviewResource($review),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete a review (super_admin only)
     */
    public function destroy($id)
    {
        try {
            $this->reviewService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get reviews written BY a specific user (for admin viewing user details)
     */
    public function getUserReviews($userId)
    {
        try {
            $reviews = $this->reviewService->getUserReviews($userId);

            return response()->json([
                'success' => true,
                'data' => $reviews,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
