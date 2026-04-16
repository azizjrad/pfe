<?php

use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Support\Facades\Route;

// Protected routes - Client only
Route::middleware(['auth:sanctum', 'not_suspended', 'role:client'])->group(function () {
    Route::get('/client/stats', [ClientController::class, 'getStats']);

    Route::get('/my-reservations', [ReservationController::class, 'clientIndex']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
});
