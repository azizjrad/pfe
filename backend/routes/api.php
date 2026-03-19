<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ConfigController;
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

// Public routes
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/pricing-config', [ConfigController::class, 'pricingConfig']);

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

    // Reservation cancellation - Available to both clients and agency admins (controller handles permission checks)
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
});

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Admin dashboard statistics
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);

    // Agency details
    Route::get('/admin/agencies/{id}', [AdminController::class, 'getAgencyDetails']);

    // User management
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetails']);
    Route::post('/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/admin/users/{id}/unsuspend', [AdminController::class, 'unsuspendUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    // Report management (view, update status, soft/hard delete)
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::get('/admin/reports/trashed', [ReportController::class, 'getTrashed']);
    Route::patch('/admin/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']);
    Route::post('/admin/reports/{id}/restore', [ReportController::class, 'restore']);
    Route::delete('/admin/reports/{id}/force', [ReportController::class, 'forceDelete']);

    // Review management (read and delete only for super admin)
    Route::get('/admin/reviews', [ReviewController::class, 'index']);
    Route::delete('/admin/reviews/{id}', [ReviewController::class, 'destroy']);

    // Get user details (reviews)
    Route::get('/admin/users/{userId}/reviews', [ReviewController::class, 'getUserReviews']);

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

    // Agency reviews (read-only)
    Route::get('/agency/reviews', [ReviewController::class, 'index']);

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

    // Submit reviews for agencies
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Client reservations (create, view, update)
    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
});

