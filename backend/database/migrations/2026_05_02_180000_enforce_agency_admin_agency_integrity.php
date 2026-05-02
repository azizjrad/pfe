<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agency_id']);
            $table->foreign('agency_id')->references('id')->on('agencies')->restrictOnDelete();
        });

        DB::statement("ALTER TABLE users ADD CONSTRAINT users_agency_admin_requires_agency_chk CHECK (role <> 'agency_admin' OR agency_id IS NOT NULL)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CHECK users_agency_admin_requires_agency_chk');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agency_id']);
            $table->foreign('agency_id')->references('id')->on('agencies')->nullOnDelete();
        });
    }
};
