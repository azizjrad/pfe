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
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('rule_type', ['discount', 'markup', 'seasonal']);
            $table->enum('condition_type', ['duration', 'season', 'category', 'agency']);
            $table->string('condition_value');
            $table->decimal('percentage', 5, 2)->comment('Percentage to apply (positive or negative)');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0)->comment('Higher priority rules apply first');
            $table->timestamps();

            $table->index('is_active');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
