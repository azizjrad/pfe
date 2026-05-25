<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->integer('year');
            $table->integer('mileage');
            $table->decimal('caution_amount', 10, 2)->nullable();
            $table->string('license_plate')->unique();
            $table->string('color');
            $table->integer('seats');
            $table->enum('transmission', ['manual', 'automatic']);
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid']);
            $table->enum('status', ['available', 'reserved', 'in_use', 'returned', 'maintenance', 'rented', 'unavailable'])->default('available');
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->timestamps();
            $table->longText('images')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
