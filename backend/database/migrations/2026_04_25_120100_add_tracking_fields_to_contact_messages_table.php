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
        Schema::table('contact_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('contact_messages', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('is_read');
            }

            if (!Schema::hasColumn('contact_messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('submitted_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            if (Schema::hasColumn('contact_messages', 'read_at')) {
                $table->dropColumn('read_at');
            }

            if (Schema::hasColumn('contact_messages', 'submitted_at')) {
                $table->dropColumn('submitted_at');
            }
        });
    }
};
