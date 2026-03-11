<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
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

// Protected routes - All authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Reports - All authenticated users can submit reports
    Route::post('/reports', [ReportController::class, 'store']);

    // Notifications - Available for both agency admins and clients
    Route::get('/user/notifications', [ClientController::class, 'getNotifications']);
});

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Admin dashboard statistics
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/financial-stats', [AdminController::class, 'getFinancialStats']);

    // Agency management (CRUD operations)
    Route::get('/admin/agencies', [AdminController::class, 'getAgencies']);
    Route::put('/admin/agencies/{id}', [AdminController::class, 'updateAgency']);
    Route::delete('/admin/agencies/{id}', [AdminController::class, 'deleteAgency']);

    // User management (CRUD operations)
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    // Report management (view, resolve, dismiss, soft/hard delete)
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::get('/admin/reports/trashed', [ReportController::class, 'getTrashed']);
    Route::post('/admin/reports/{id}/resolve', [ReportController::class, 'resolve']);
    Route::post('/admin/reports/{id}/dismiss', [ReportController::class, 'dismiss']);
    Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']);
    Route::post('/admin/reports/{id}/restore', [ReportController::class, 'restore']);
    Route::delete('/admin/reports/{id}/force', [ReportController::class, 'forceDelete']);
    Route::post('/admin/reports/clean-trash', [ReportController::class, 'cleanOldTrash']);

    // Review management (read and delete only for super admin)
    Route::get('/admin/reviews', [ReviewController::class, 'index']);
    Route::delete('/admin/reviews/{id}', [ReviewController::class, 'destroy']);

    // Get user details (reviews and reports)
    Route::get('/admin/users/{userId}/reviews', [ReviewController::class, 'getUserReviews']);
    Route::get('/admin/users/{userId}/reports-submitted', [ReportController::class, 'getUserReports']);
    Route::get('/admin/users/{userId}/reports-against', [ReportController::class, 'getReportsAgainstUser']);

    // Get agency details (reports)
    Route::get('/admin/agencies/{agencyId}/reports', [ReportController::class, 'getReportsAgainstAgency']);

    // Get agency vehicles (vitrine)
    Route::get('/admin/agencies/{agencyId}/vehicles', [AdminController::class, 'getAgencyVehicles']);
});

// Protected routes - Agency Admin & Super Admin
Route::middleware(['auth:sanctum', 'role:agency_admin,super_admin'])->group(function () {
    // Agency statistics and financial data
    Route::get('/agency/stats', [AgencyController::class, 'getStats']);
    Route::get('/agency/financial-stats', [AgencyController::class, 'getFinancialStats']);

    // Agency reviews (read-only)
    Route::get('/agency/reviews', [ReviewController::class, 'index']);

    // Agency vehicle reports (read-only)
    Route::get('/agency/reports', [ReportController::class, 'getAgencyReports']);

    // Agency reservation management
    Route::get('/agency/reservations', [ReservationController::class, 'agencyIndex']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/reservations/{id}/pickup', [ReservationController::class, 'pickupVehicle']);
    Route::post('/reservations/{id}/return', [ReservationController::class, 'returnVehicle']);
});

// Protected routes - Client only
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    // Client statistics and reliability score
    Route::get('/client/stats', [ClientController::class, 'getStats']);

    // Submit reviews for agencies
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Client reservations (create, view, update, cancel)
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
});

