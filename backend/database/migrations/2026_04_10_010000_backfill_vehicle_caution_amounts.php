<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('vehicles')
            ->where(function ($query) {
                $query->whereNull('caution_amount')
                    ->orWhere('caution_amount', '<=', 0);
            })
            ->update([
                'caution_amount' => DB::raw('ROUND(GREATEST(daily_price * 10, 500), 2)'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Non-destructive rollback: this migration fills business data for legacy records.
    }
};
