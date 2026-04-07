<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds contract-related fields to reservations for PDF generation:
     * - Client birth date for contract generation
     * - Deposit amount for franchise/caution display
     * - Driver name and license information for conducteur section
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Client information for contract
            $table->date('client_birth_date')->nullable()->comment('Client birth date for contract');
            $table->decimal('deposit_amount', 10, 2)->nullable()->comment('Deposit/Caution amount');
            
            // Driver information for contract - "CONDUCTEURS" section
            $table->string('driver_first_name')->nullable()->comment('Driver first name');
            $table->string('driver_last_name')->nullable()->comment('Driver last name');
            $table->date('driver_birth_date')->nullable()->comment('Driver birth date');
            $table->string('driver_license_number')->nullable()->comment('Driver license number');
            $table->date('driver_license_date')->nullable()->comment('Driver license issue date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'client_birth_date',
                'deposit_amount',
                'driver_first_name',
                'driver_last_name',
                'driver_birth_date',
                'driver_license_number',
                'driver_license_date',
            ]);
        });
    }
};
