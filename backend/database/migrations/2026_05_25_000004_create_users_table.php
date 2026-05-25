<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('must_change_password')->default(false);
            $table->enum('role', ['client', 'agency_admin', 'super_admin'])->default('client')->index();
            $table->foreignId('agency_id')->nullable()->constrained('agencies')->restrictOnDelete();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('driver_license')->nullable();
            $table->boolean('is_suspended')->default(false);
            $table->text('suspension_reason')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
