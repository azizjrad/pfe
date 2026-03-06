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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->enum('report_type', ['vehicle', 'agency', 'client'])->comment('Type of report');
            $table->unsignedBigInteger('target_id')->comment('ID of the reported entity');
            $table->string('target_name')->comment('Name of the reported entity');
            $table->string('reason')->comment('Short reason for report');
            $table->text('description')->comment('Detailed description');
            $table->unsignedBigInteger('reported_by_user_id')->nullable()->comment('User who reported');
            $table->string('reported_by_name')->comment('Name of reporter');
            $table->enum('status', ['pending', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable()->comment('Admin resolution notes');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete for trash functionality');

            // Indexes
            $table->index('report_type');
            $table->index('status');
            $table->index('reported_by_user_id');
            $table->index('deleted_at');

            // Foreign key
            $table->foreign('reported_by_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
