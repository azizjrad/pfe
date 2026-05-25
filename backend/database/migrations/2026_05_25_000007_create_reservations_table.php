<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->date('start_date')->index();
            $table->date('end_date');
            $table->string('pickup_location')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->decimal('total_price', 10, 2);
            $table->decimal('platform_commission', 10, 2)->default(0);
            $table->decimal('agency_payout', 10, 2)->default(0);
            $table->enum('status', ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'])->default('pending')->index();
            $table->date('actual_return_date')->nullable();
            $table->boolean('is_late_return')->default(false);
            $table->text('cancellation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->date('client_birth_date')->nullable();
            $table->string('driver_first_name')->nullable();
            $table->string('driver_last_name')->nullable();
            $table->date('driver_birth_date')->nullable();
            $table->string('driver_license_number')->nullable();
            $table->date('driver_license_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
