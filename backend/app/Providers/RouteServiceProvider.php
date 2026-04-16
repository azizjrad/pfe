<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define your route model bindings, pattern filters, and route files.
     */
    public function boot(): void
    {
        $this->routes(function () {
            $contexts = [
                'auth' => 'auth.php',
                'public' => 'public.php',
                'admin' => 'admin.php',
                'agency' => 'agency.php',
                'client' => 'client.php',
            ];

            foreach ($contexts as $context => $file) {
                Route::middleware('api')
                    ->prefix('api')
                    ->name("api.{$context}.")
                    ->group(base_path("routes/api/{$file}"));
            }
        });
    }
}
