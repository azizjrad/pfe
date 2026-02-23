<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('pickup_location')->nullable()->comment('Where customer picks up vehicle');
            $table->string('dropoff_location')->nullable()->comment('Where customer returns vehicle');
            $table->decimal('base_price', 10, 2)->comment('Base rental cost before adjustments');
            $table->decimal('discount_amount', 10, 2)->default(0)->comment('Discounts applied');
            $table->decimal('additional_charges', 10, 2)->default(0)->comment('Late fees, damages, etc');
            $table->decimal('total_price', 10, 2)->comment('Final amount to pay');
            $table->decimal('paid_amount', 10, 2)->default(0)->comment('Amount already paid');
            $table->decimal('remaining_amount', 10, 2)->default(0)->comment('Outstanding balance');
            $table->enum('payment_status', ['unpaid', 'partially_paid', 'paid', 'overdue'])->default('unpaid');
            $table->enum('status', ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'])->default('pending');
            $table->date('actual_return_date')->nullable()->comment('When vehicle was actually returned');
            $table->boolean('is_late_return')->default(false);
            $table->text('cancellation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
            $table->index('payment_status');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
