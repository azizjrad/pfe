<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessageReply extends Model
{
    protected $fillable = [
        'contact_message_id',
        'reply',
        'replied_by_email',
        'replied_at',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    /**
     * Get the parent contact message.
     */
    public function contactMessage()
    {
        return $this->belongsTo(ContactMessage::class);
    }
}
