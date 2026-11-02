<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_text',
        'processed_text',
        'ai_score',
        'human_score',
        'confidence',
        'word_count',
        'processing_time',
        'status',
        'error_message',
        'indicators',
        'detection_method',
    ];

    protected $casts = [
        'indicators' => 'array',
        'ai_score' => 'float',
        'human_score' => 'float',
        'confidence' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function history()
    {
        return $this->hasOne(History::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}