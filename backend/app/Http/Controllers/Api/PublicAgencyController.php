<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgencyResource;
use App\Services\AgencyService;
use Illuminate\Http\Request;

class PublicAgencyController extends Controller
{
    private AgencyService $agencyService;

    public function __construct(AgencyService $agencyService)
    {
        $this->agencyService = $agencyService;
    }

    /**
     * Get all agencies (public endpoint)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->query('per_page', 12);
            $agencies = $this->agencyService->getPublicAgencies($perPage);

            return response()->json([
                'success' => true,
                'data' => AgencyResource::collection($agencies),
                'pagination' => [
                    'current_page' => $agencies->currentPage(),
                    'per_page' => $agencies->perPage(),
                    'total' => $agencies->total(),
                    'total_pages' => $agencies->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch agencies',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get agency details (public endpoint)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $agency = $this->agencyService->getPublicAgencyById((int) $id);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Agency not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch agency details',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get agency by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySlug($slug)
    {
        try {
            $agency = $this->agencyService->getPublicAgencyBySlug($slug);

            return response()->json([
                'success' => true,
                'data' => new AgencyResource($agency),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Agency not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch agency details',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
