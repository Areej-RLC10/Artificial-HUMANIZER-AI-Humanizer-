<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    use HasFactory;

    protected $table = 'history';

    protected $fillable = [
        'user_id',
        'action',
        'original_text',
        'result_text',
        'ai_score',
    ];

    protected $casts = [
        'ai_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}