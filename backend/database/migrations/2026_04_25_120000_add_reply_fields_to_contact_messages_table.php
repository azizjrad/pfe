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
            $table->text('admin_reply')->nullable()->after('message');
            $table->string('replied_by_email')->nullable()->after('admin_reply');
            $table->timestamp('replied_at')->nullable()->after('replied_by_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn(['admin_reply', 'replied_by_email', 'replied_at']);
        });
    }
};
