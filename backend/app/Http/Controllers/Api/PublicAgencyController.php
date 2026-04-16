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
        $perPage = $this->resolvePerPage($request, 12, 100);
        $agencies = $this->agencyService->getPublicAgencies($perPage)
            ->appends($request->query());

        return $this->apiSuccessResponse(null, AgencyResource::collection($agencies->items()), 200, [
            'pagination' => $this->paginationMeta($agencies),
        ]);
    }

    /**
     * Get agency details (public endpoint)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $agency = $this->agencyService->getPublicAgencyById((int) $id);

        return $this->apiSuccessResponse(null, new AgencyResource($agency));
    }

    /**
     * Get agency by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySlug($slug)
    {
        $agency = $this->agencyService->getPublicAgencyBySlug($slug);

        return $this->apiSuccessResponse(null, new AgencyResource($agency));
    }
}
