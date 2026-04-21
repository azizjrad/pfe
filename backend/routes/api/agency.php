<?php

use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// Protected routes - Agency Admin & Super Admin
Route::middleware(['auth:sanctum', 'not_suspended', 'password_changed', 'role:agency_admin,super_admin'])->group(function () {
    Route::get('/agency/stats', [AgencyController::class, 'getStats']);
    Route::get('/agency/financial-stats', [AgencyController::class, 'getFinancialStats']);

    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    Route::get('/agency/reports', [ReportController::class, 'getAgencyReports']);

    Route::get('/agency/reservations', [ReservationController::class, 'agencyIndex']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/reservations/{id}/pickup', [ReservationController::class, 'pickupVehicle']);
    Route::post('/reservations/{id}/return', [ReservationController::class, 'returnVehicle']);
});
