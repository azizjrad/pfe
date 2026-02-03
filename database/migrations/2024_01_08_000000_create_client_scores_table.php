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
        Schema::create('client_reliability_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('total_reservations')->default(0);
            $table->integer('completed_reservations')->default(0);
            $table->integer('cancelled_reservations')->default(0);
            $table->integer('late_returns')->default(0);
            $table->integer('payment_delays')->default(0);
            $table->integer('damage_incidents')->default(0);
            $table->decimal('total_unpaid_amount', 10, 2)->default(0)->comment('Outstanding balance');
            $table->integer('reliability_score')->default(100)->comment('0-100, calculated automatically');
            $table->enum('risk_level', ['low', 'medium', 'high', 'blocked'])->default('low');
            $table->text('admin_notes')->nullable()->comment('Internal notes about client behavior');
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index('reliability_score');
            $table->index('risk_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_reliability_scores');
    }
};
