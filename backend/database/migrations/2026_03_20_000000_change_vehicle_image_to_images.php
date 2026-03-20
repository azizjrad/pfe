<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add the new 'images' column if it doesn't exist
        if (!Schema::hasColumn('vehicles', 'images')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $table->json('images')->nullable();
            });
        }

        // Copy data from 'image' to 'images' -- wrap single image in array
        DB::statement("UPDATE vehicles SET images = JSON_ARRAY(image) WHERE image IS NOT NULL AND images IS NULL");

        // Drop the old 'image' column if it exists
        if (Schema::hasColumn('vehicles', 'image')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the old 'image' column if it doesn't exist
        if (!Schema::hasColumn('vehicles', 'image')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $table->string('image')->nullable();
            });
        }

        // Copy first image from JSON array back to 'image' column
        DB::statement("UPDATE vehicles SET image = JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]')) WHERE images IS NOT NULL AND image IS NULL");

        // Drop the 'images' column if it exists
        if (Schema::hasColumn('vehicles', 'images')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $table->dropColumn('images');
            });
        }
    }
};
