<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'is_read',
        'admin_reply',
        'replied_by_email',
        'replied_at',
        'read_at',
        'submitted_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'replied_at' => 'datetime',
        'read_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get all replies for this contact message.
     */
    public function replies()
    {
        return $this->hasMany(ContactMessageReply::class)->orderBy('replied_at')->orderBy('id');
    }

    /**
     * Get the latest reply for compatibility with the existing UI.
     */
    public function latestReply()
    {
        return $this->hasOne(ContactMessageReply::class)->latestOfMany('replied_at');
    }
}
