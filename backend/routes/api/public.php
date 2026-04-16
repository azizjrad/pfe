<?php

use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PublicAgencyController;
use App\Http\Controllers\Api\PublicVehicleController;
use Illuminate\Support\Facades\Route;

// Public contact form submission
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1');

// Public chatbot endpoint
Route::post('/chatbot/message', [ChatbotController::class, 'reply'])
    ->middleware('throttle:20,1');

// Public browse endpoints
Route::prefix('public')->group(function () {
    Route::get('/vehicles', [PublicVehicleController::class, 'index']);
    Route::get('/vehicles/{id}', [PublicVehicleController::class, 'show']);
    Route::get('/vehicles/agency/{agencyId}', [PublicVehicleController::class, 'byAgency']);

    Route::get('/agencies', [PublicAgencyController::class, 'index']);
    Route::get('/agencies/{id}', [PublicAgencyController::class, 'show']);
    Route::get('/agencies/slug/{slug}', [PublicAgencyController::class, 'bySlug']);
});
