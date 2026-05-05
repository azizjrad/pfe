<?php

namespace App\Providers;

use App\Models\Agency;
use App\Models\Report;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Mail\Transport\BrevoTransport;
use App\Policies\AgencyPolicy;
use App\Policies\ReportPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\VehiclePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Mail\MailManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->afterResolving(MailManager::class, function (MailManager $manager): void {
            $manager->extend('brevo', function (array $config) {
                return new BrevoTransport(
                    apiKey: $config['api_key'] ?? env('BREVO_API_KEY'),
                    endpoint: $config['endpoint'] ?? env('BREVO_API_ENDPOINT', 'https://api.brevo.com/v3/smtp/email')
                );
            });
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('reset-password', function (Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));
            $ip = (string) $request->ip();

            return [
                Limit::perMinute(5)->by('reset-password:ip:' . $ip),
                Limit::perMinute(3)->by('reset-password:email:' . ($email !== '' ? $email : $ip)),
                Limit::perHour(25)->by('reset-password:ip-hour:' . $ip),
            ];
        });

        Gate::policy(Reservation::class, ReservationPolicy::class);
        Gate::policy(Agency::class, AgencyPolicy::class);
        Gate::policy(Report::class, ReportPolicy::class);
        Gate::policy(Vehicle::class, VehiclePolicy::class);
    }
}
