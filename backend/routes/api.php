<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\PublicVehicleController;
use App\Http\Controllers\Api\PublicAgencyController;
use App\Http\Controllers\Api\VehicleController;
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
    ->middleware('throttle:5,1');  // Rate limit: 5 attempts per minute (brute force protection)
// Password reset (set password via token sent in invite/reset)
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public contact form submission
Route::post('/contact', [ContactController::class, 'store']);

// Protected routes - All authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Protected configuration endpoint
    Route::get('/pricing-config', [ConfigController::class, 'pricingConfig']);

    // Protected browse endpoints (previously public)
    Route::prefix('public')->group(function () {
        // Vehicles
        Route::get('/vehicles', [PublicVehicleController::class, 'index']);
        Route::get('/vehicles/{id}', [PublicVehicleController::class, 'show']);
        Route::get('/vehicles/agency/{agencyId}', [PublicVehicleController::class, 'byAgency']);

        // Agencies
        Route::get('/agencies', [PublicAgencyController::class, 'index']);
        Route::get('/agencies/{id}', [PublicAgencyController::class, 'show']);
        Route::get('/agencies/slug/{slug}', [PublicAgencyController::class, 'bySlug']);
    });

    // Reports - All authenticated users can submit reports
    Route::post('/reports', [ReportController::class, 'store']);

    // Notifications - Available for both agency admins and clients
    Route::get('/user/notifications', [ClientController::class, 'getNotifications']);
    Route::patch('/user/notifications/{id}/read', [ClientController::class, 'markNotificationAsRead']);
    Route::patch('/user/notifications/read-all', [ClientController::class, 'markAllNotificationsAsRead']);

    // Reservation cancellation - Available to both clients and agency admins (controller handles permission checks)
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
});

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Admin dashboard statistics
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/reservations', [ReservationController::class, 'index']);

    // Admin agencies list
    Route::get('/admin/agencies', [AdminController::class, 'getAgencies']);

    // Agency details
    Route::get('/admin/agencies/{id}', [AdminController::class, 'getAgencyDetails']);
    Route::get('/admin/agencies/{id}/vehicles', [AdminController::class, 'getAgencyVehicles']);
    Route::get('/admin/agencies/{id}/reports', [ReportController::class, 'getAgencyReportsAgainst']);
    // Update agency (supports status changes)
    Route::put('/admin/agencies/{id}', [AdminController::class, 'updateAgency']);
    Route::delete('/admin/agencies/{id}', [AdminController::class, 'deleteAgency']);
    // Create agency
    Route::post('/admin/agencies', [AdminController::class, 'createAgency']);

    // Financial statistics for admin
    Route::get('/admin/financial-stats', [AdminController::class, 'getFinancialStats']);

    // User management
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetails']);
    Route::get('/admin/users/{id}/reports-submitted', [ReportController::class, 'getUserReportsSubmitted']);
    Route::get('/admin/users/{id}/reports-against', [ReportController::class, 'getUserReportsAgainst']);
    // Create a user
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::post('/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/admin/users/{id}/unsuspend', [AdminController::class, 'unsuspendUser']);
    // Update user (supports is_suspended toggle and profile updates)
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    // Report management (view, update status, soft/hard delete)
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::get('/admin/reports/trashed', [ReportController::class, 'getTrashed']);
    Route::patch('/admin/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']);
    Route::post('/admin/reports/{id}/restore', [ReportController::class, 'restore']);
    Route::delete('/admin/reports/{id}/force', [ReportController::class, 'forceDelete']);

    // Contact messages (view, mark as read, delete)
    Route::get('/admin/contact-messages', [ContactController::class, 'index']);
    Route::patch('/admin/contact-messages/{contactMessage}/read', [ContactController::class, 'markAsRead']);
    Route::delete('/admin/contact-messages/{contactMessage}', [ContactController::class, 'destroy']);
});

// Protected routes - Agency Admin & Super Admin
Route::middleware(['auth:sanctum', 'role:agency_admin,super_admin'])->group(function () {
    // Agency statistics and financial data
    Route::get('/agency/stats', [AgencyController::class, 'getStats']);
    Route::get('/agency/financial-stats', [AgencyController::class, 'getFinancialStats']);

    // Agency vehicle management
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    // Agency vehicle reports (read-only)
    Route::get('/agency/reports', [ReportController::class, 'getAgencyReports']);

    // Agency reservation management
    Route::get('/agency/reservations', [ReservationController::class, 'agencyIndex']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/reservations/{id}/pickup', [ReservationController::class, 'pickupVehicle']);
    Route::post('/reservations/{id}/return', [ReservationController::class, 'returnVehicle']);
});

// Protected routes - Client only
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    // Client statistics and reliability score
    Route::get('/client/stats', [ClientController::class, 'getStats']);

    // Client reservations (create, view, update)
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
});

