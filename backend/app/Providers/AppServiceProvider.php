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
use Illuminate\Support\Facades\Gate;
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
        Gate::policy(Reservation::class, ReservationPolicy::class);
        Gate::policy(Agency::class, AgencyPolicy::class);
        Gate::policy(Report::class, ReportPolicy::class);
        Gate::policy(Vehicle::class, VehiclePolicy::class);
    }
}
