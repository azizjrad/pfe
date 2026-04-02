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
        DB::statement("ALTER TABLE vehicles MODIFY COLUMN status ENUM('available','reserved','in_use','returned','maintenance','rented','unavailable') NOT NULL DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE vehicles SET status = 'available' WHERE status IN ('reserved','in_use','returned')");
        DB::statement("ALTER TABLE vehicles MODIFY COLUMN status ENUM('available','rented','maintenance','unavailable') NOT NULL DEFAULT 'available'");
    }
};
