<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'reservation_id',
        'amount',
        'payment_date',
        'payment_method',
        'payment_type',
        'status',
        'cheque_number',
        'cheque_deposit_date',
        'cheque_status',
        'transaction_reference',
        'due_date',
        'is_late',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'cheque_deposit_date' => 'date',
        'due_date' => 'date',
        'is_late' => 'boolean',
    ];

    /**
     * Get the reservation this payment belongs to.
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Check if payment is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if payment is by cheque.
     */
    public function isCheque()
    {
        return $this->payment_method === 'cheque';
    }

    /**
     * Check if cheque needs to be deposited.
     */
    public function chequeNeedsDeposit()
    {
        return $this->isCheque() && $this->cheque_status === 'pending_deposit';
    }

    /**
     * Get payment type label in French.
     */
    public function getTypeLabel()
    {
        return match($this->payment_type) {
            'deposit' => 'Acompte',
            'partial' => 'Paiement partiel',
            'full' => 'Paiement complet',
            'balance' => 'Solde',
            'additional_charges' => 'Frais supplémentaires',
            default => $this->payment_type,
        };
    }
}
