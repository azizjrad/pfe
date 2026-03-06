<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'report_type',
        'target_id',
        'target_name',
        'reason',
        'description',
        'reported_by_user_id',
        'reported_by_name',
        'status',
        'admin_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
        'resolved_at',
    ];

    /**
     * Get the user who reported
     */
    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    /**
     * Scope to get only active reports (not soft deleted)
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    /**
     * Scope to get only trashed reports
     */
    public function scopeOnlyTrashed($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by report type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('report_type', $type);
    }
}
