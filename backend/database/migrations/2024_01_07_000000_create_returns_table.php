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
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->dateTime('return_date');
            $table->integer('return_mileage');
            $table->enum('vehicle_condition', ['excellent', 'good', 'fair', 'damaged'])->default('good');
            $table->decimal('additional_charges', 10, 2)->default(0);
            $table->text('damage_notes')->nullable();
            $table->text('inspection_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
