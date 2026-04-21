<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:reset-password');

// Protected routes for all authenticated users
Route::middleware(['auth:sanctum', 'not_suspended'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::middleware('password_changed')->group(function () {
        Route::get('/pricing-config', [ConfigController::class, 'pricingConfig']);

        // Reports - all authenticated users can submit reports
        Route::post('/reports', [ReportController::class, 'store']);

        // Shared notifications endpoints
        Route::get('/user/notifications', [ClientController::class, 'getNotifications']);
        Route::patch('/user/notifications/{id}/read', [ClientController::class, 'markNotificationAsRead']);
        Route::patch('/user/notifications/read-all', [ClientController::class, 'markAllNotificationsAsRead']);

        // Shared cancellation endpoint with permission checks in controller/service
        Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    });
});
