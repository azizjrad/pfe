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
        if (Schema::hasColumn('client_reliability_scores', 'total_unpaid_amount')) {
            Schema::table('client_reliability_scores', function (Blueprint $table) {
                $table->dropColumn('total_unpaid_amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('client_reliability_scores', 'total_unpaid_amount')) {
            Schema::table('client_reliability_scores', function (Blueprint $table) {
                $table->decimal('total_unpaid_amount', 10, 2)->default(0)->comment('Outstanding balance');
            });
        }
    }
};
