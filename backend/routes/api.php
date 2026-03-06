<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ReportController;
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

    // Reports - Create (all authenticated users can report)
    Route::post('/reports', [ReportController::class, 'store']);
});

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Admin dashboard statistics
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/financial-stats', [AdminController::class, 'getFinancialStats']);

    // Gestion des agences
    Route::get('/admin/agencies', [AdminController::class, 'getAgencies']);
    Route::put('/admin/agencies/{id}', [AdminController::class, 'updateAgency']);
    Route::delete('/admin/agencies/{id}', [AdminController::class, 'deleteAgency']);

    // Gestion des utilisateurs
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    // Gestion des signalements
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::get('/admin/reports/trashed', [ReportController::class, 'getTrashed']);
    Route::post('/admin/reports/{id}/resolve', [ReportController::class, 'resolve']);
    Route::post('/admin/reports/{id}/dismiss', [ReportController::class, 'dismiss']);
    Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']); // Move to trash
    Route::post('/admin/reports/{id}/restore', [ReportController::class, 'restore']);
    Route::delete('/admin/reports/{id}/force', [ReportController::class, 'forceDelete']); // Permanent delete
    Route::post('/admin/reports/clean-trash', [ReportController::class, 'cleanOldTrash']);
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
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/reservations/{id}/pickup', [ReservationController::class, 'pickupVehicle']);
    Route::post('/reservations/{id}/return', [ReservationController::class, 'returnVehicle']);
});

// Protected routes - Client only
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    // Réservations du client
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
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

