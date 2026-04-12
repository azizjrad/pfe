<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini_compatible' => [
        'api_key' => env('GEMINI_API_KEY', env('OPENAI_API_KEY')),
        'base_url' => env('GEMINI_BASE_URL', env('OPENAI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai')),
        'model' => env('GEMINI_MODEL', env('OPENAI_MODEL', 'gemini-2.0-flash')),
        'site_url' => env('GEMINI_SITE_URL', env('OPENAI_SITE_URL', env('FRONTEND_URL', 'http://localhost:5173'))),
        'site_name' => env('GEMINI_SITE_NAME', env('OPENAI_SITE_NAME', env('APP_NAME', 'Elite Drive'))),
        'system_prompt' => env('GEMINI_SYSTEM_PROMPT', env('OPENAI_SYSTEM_PROMPT', 'Tu es un assistant utile et concis pour une plateforme de location de voitures. Réponds en français.')),
    ],

];
