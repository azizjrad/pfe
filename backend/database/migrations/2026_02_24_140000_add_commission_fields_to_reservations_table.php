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
        Schema::table('reservations', function (Blueprint $table) {
            $table->decimal('platform_commission_rate', 5, 4)->default(0.08)->after('total_price');
            $table->decimal('platform_commission', 10, 2)->default(0)->after('platform_commission_rate');
            $table->decimal('agency_payout', 10, 2)->default(0)->after('platform_commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['platform_commission_rate', 'platform_commission', 'agency_payout']);
        });
    }
};
