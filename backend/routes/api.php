<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');  // Max 5 tentatives par minute (protection brute force)

// Public pricing routes (for transparency)
Route::get('/pricing/rules', [PricingController::class, 'getPricingRules']);
Route::get('/vehicles/{vehicleId}/pricing', [PricingController::class, 'getVehiclePricing']);

// Protected routes - All authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dynamic pricing calculation
    Route::post('/pricing/calculate', [PricingController::class, 'calculatePrice']);
});

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Gestion des agences (admin only)
    // Route::get('/agencies', [AgencyController::class, 'index']);
    // Route::post('/agencies', [AgencyController::class, 'store']);
    // Route::put('/agencies/{id}', [AgencyController::class, 'update']);
    // Route::delete('/agencies/{id}', [AgencyController::class, 'destroy']);

    // Gestion des utilisateurs (admin only)
    // Route::get('/users', [UserController::class, 'index']);
    // Route::put('/users/{id}', [UserController::class, 'update']);
    // Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Protected routes - Agency Admin & Super Admin
Route::middleware(['auth:sanctum', 'role:agency_admin,super_admin'])->group(function () {
    // Gestion des véhicules
    // Route::get('/vehicles', [VehicleController::class, 'index']);
    // Route::post('/vehicles', [VehicleController::class, 'store']);
    // Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    // Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    // Gestion des réservations de l'agence
    Route::get('/agency/reservations', [ReservationController::class, 'agencyIndex']);
});

// Protected routes - Client only
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    // Réservations du client
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    // Score de fiabilité
    // Route::get('/my-score', [ClientScoreController::class, 'show']);
});

// Protected routes - All authenticated users (clients, agency admins, super admins)
Route::middleware(['auth:sanctum', 'role:client,agency_admin,super_admin'])->group(function () {
    // Véhicules disponibles (lecture seule pour tous)
    // Route::get('/vehicles/available', [VehicleController::class, 'available']);

    // Catégories de véhicules
    // Route::get('/categories', [CategoryController::class, 'index']);
});

