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
            $perPage = $this->resolvePerPage($request, 12, 100);
            $agencies = $this->agencyService->getPublicAgencies($perPage)
                ->appends($request->query());

            return response()->json([
                'success' => true,
                'data' => AgencyResource::collection($agencies->items()),
                'pagination' => $this->paginationMeta($agencies),
            ]);
        } catch (\Exception $e) {
            return $this->apiErrorResponse($e, 'Impossible de recuperer les agences publiques.', 500, [
                'action' => 'public_agencies.index',
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de recuperer les details de l\'agence.', 500, [
                'action' => 'public_agencies.show',
                'agency_id' => (int) $id,
            ]);
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
            return $this->apiErrorResponse($e, 'Impossible de recuperer les details de l\'agence.', 500, [
                'action' => 'public_agencies.by_slug',
                'slug' => $slug,
            ]);
        }
    }
}
