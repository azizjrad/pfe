<?php

return [

    'app_name' => env('APP_NAME', 'Gestion de Location de Véhicules'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

    'locale' => 'fr',

    'pagination' => [
        'per_page' => 15,
        'max_per_page' => 100,
    ],

    'uploads' => [
        'vehicle_images' => 'vehicles',
        'documents' => 'documents',
        'max_size' => 5120, // KB
        'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf'],
    ],

    'pricing' => [
        'currency' => 'TND',
        'currency_symbol' => 'DT',
        'default_daily_price' => 150,
    ],

    'reliability_scoring' => [
        'cancelled_penalty' => 5,
        'late_return_penalty' => 10,
        'payment_delay_penalty' => 15,
        'damage_penalty' => 20,
        'unpaid_penalty' => 30,
        'blocked_threshold' => 30,
        'high_risk_threshold' => 50,
        'medium_risk_threshold' => 80,
    ],

];
