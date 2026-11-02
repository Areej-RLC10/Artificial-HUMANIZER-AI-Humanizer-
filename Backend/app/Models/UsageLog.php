<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'request_data',
        'response_data',
        'response_time',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}