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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->decimal('caution_amount', 10, 2)
                ->nullable()
                ->after('daily_price')
                ->comment('Caution amount defined by agency');
        });

        Schema::table('reservations', function (Blueprint $table) {
            if (Schema::hasColumn('reservations', 'deposit_amount')) {
                $table->dropColumn('deposit_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'deposit_amount')) {
                $table->decimal('deposit_amount', 10, 2)
                    ->nullable()
                    ->after('client_birth_date')
                    ->comment('Deposit/Caution amount');
            }
        });

        Schema::table('vehicles', function (Blueprint $table) {
            if (Schema::hasColumn('vehicles', 'caution_amount')) {
                $table->dropColumn('caution_amount');
            }
        });
    }
};
