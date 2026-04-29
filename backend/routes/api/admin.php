<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Support\Facades\Route;

// Protected routes - Super Admin only
Route::middleware(['auth:sanctum', 'not_suspended', 'password_changed', 'role:super_admin'])->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/reservations', [ReservationController::class, 'index']);

    Route::get('/admin/agencies', [AdminController::class, 'getAgencies']);
    Route::get('/admin/agencies/{id}', [AdminController::class, 'getAgencyDetails']);
    Route::get('/admin/agencies/{id}/vehicles', [AdminController::class, 'getAgencyVehicles']);
    Route::get('/admin/agencies/{id}/reports', [ReportController::class, 'getAgencyReportsAgainst']);
    Route::put('/admin/agencies/{id}', [AdminController::class, 'updateAgency']);
    Route::post('/admin/agencies', [AdminController::class, 'createAgency']);

    Route::get('/admin/financial-stats', [AdminController::class, 'getFinancialStats']);

    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetails']);
    Route::get('/admin/users/{id}/reports-submitted', [ReportController::class, 'getUserReportsSubmitted']);
    Route::get('/admin/users/{id}/reports-against', [ReportController::class, 'getUserReportsAgainst']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::post('/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/admin/users/{id}/unsuspend', [AdminController::class, 'unsuspendUser']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::get('/admin/reports/trashed', [ReportController::class, 'getTrashed']);
    Route::patch('/admin/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']);
    Route::post('/admin/reports/{id}/restore', [ReportController::class, 'restore']);
    Route::delete('/admin/reports/{id}/force', [ReportController::class, 'forceDelete']);

    Route::get('/admin/contact-messages', [ContactController::class, 'index']);
    Route::patch('/admin/contact-messages/{contactMessage}/read', [ContactController::class, 'markAsRead']);
    Route::post('/admin/contact-messages/{contactMessage}/reply', [ContactController::class, 'reply']);
    Route::delete('/admin/contact-messages/{contactMessage}', [ContactController::class, 'destroy']);
});
