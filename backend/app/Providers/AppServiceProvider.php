<?php

namespace App\Providers;

use App\Models\Agency;
use App\Models\Report;
use App\Models\Reservation;
use App\Models\Vehicle;
use App\Policies\AgencyPolicy;
use App\Policies\ReportPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\VehiclePolicy;
use Illuminate\Cache\RateLimiting\Limit;
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
        //
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
