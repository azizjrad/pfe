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
        'add_ons' => [
            'full_insurance' => [
                'type' => 'percentage',
                'value' => 0.15, // 15% of base price
                'display_name' => 'Assurance tous risques',
            ],
            'airport_delivery' => [
                'type' => 'fixed',
                'value' => 10, // Fixed 10 DT
                'display_name' => 'Livraison aéroport',
            ],
            'home_delivery' => [
                'type' => 'fixed',
                'value' => 25, // Fixed 25 DT
                'display_name' => 'Livraison à domicile',
            ],
            'after_hours_pickup' => [
                'type' => 'fixed',
                'value' => 15, // Fixed 15 DT
                'display_name' => 'Prise en charge hors horaires',
            ],
        ],
    ],

    'commission' => [
        'platform_rate' => 0.05, // 5% platform commission
        'min_commission' => 5, // Minimum commission in DT
    ],

    'reliability_scoring' => [
        'cancelled_penalty' => 5,
        'late_return_penalty' => 10,
        'payment_delay_penalty' => 15,
        'damage_penalty' => 20,
        'blocked_threshold' => 30,
        'high_risk_threshold' => 50,
        'medium_risk_threshold' => 80,
    ],

];
