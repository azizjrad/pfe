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
        Schema::table('client_reliability_scores', function (Blueprint $table) {
            if (!Schema::hasColumn('client_reliability_scores', 'total_unpaid_amount')) {
                $table->decimal('total_unpaid_amount', 10, 2)->default(0)->after('damage_incidents');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('client_reliability_scores', function (Blueprint $table) {
            if (Schema::hasColumn('client_reliability_scores', 'total_unpaid_amount')) {
                $table->dropColumn('total_unpaid_amount');
            }
        });
    }
};
