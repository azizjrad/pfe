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
            $table->text('description')->nullable();
            $table->enum('rule_type', ['seasonal', 'duration', 'category', 'agency'])->comment('Type of pricing rule');
            $table->enum('adjustment_type', ['percentage', 'fixed'])->comment('How adjustment is applied');
            $table->decimal('adjustment_value', 10, 2)->comment('Percentage or fixed amount adjustment');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->foreignId('agency_id')->nullable()->constrained('agencies')->onDelete('cascade');
            $table->integer('min_rental_days')->nullable();
            $table->integer('max_rental_days')->nullable();
            $table->integer('priority')->default(0)->comment('Higher priority rules apply first');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index(['start_date', 'end_date']);
            $table->index('rule_type');
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
