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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->decimal('amount', 10, 2)->comment('Amount of this payment');
            $table->dateTime('payment_date');
            $table->enum('payment_method', ['cash', 'cheque', 'credit_card', 'bank_transfer'])->comment('Payment method used');
            $table->enum('payment_type', ['deposit', 'partial', 'full', 'balance', 'additional_charges'])->default('full');
            $table->enum('status', ['pending', 'completed', 'failed', 'overdue', 'refunded'])->default('pending');
            $table->string('cheque_number')->nullable()->comment('Cheque number if payment_method is cheque');
            $table->date('cheque_deposit_date')->nullable()->comment('When cheque was deposited');
            $table->enum('cheque_status', ['pending_deposit', 'deposited', 'cleared', 'bounced'])->nullable();
            $table->string('transaction_reference')->nullable()->comment('Bank reference or receipt number');
            $table->date('due_date')->nullable()->comment('Payment deadline for installments');
            $table->boolean('is_late')->default(false)->comment('Payment received after due date');
            $table->text('notes')->nullable()->comment('Payment notes or conditions');
            $table->timestamps();

            $table->index(['reservation_id', 'status']);
            $table->index('payment_date');
            $table->index(['cheque_status', 'cheque_deposit_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
