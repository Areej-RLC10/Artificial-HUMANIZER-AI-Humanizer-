<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'credits',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_active' => 'datetime',
    ];

    public function analyses()
    {
        return $this->hasMany(Analysis::class);
    }

    public function history()
    {
        return $this->hasMany(History::class);
    }

    public function usageLogs()
    {
        return $this->hasMany(UsageLog::class);
    }

    public function hasEnoughCredits($amount = 1)
    {
        return $this->credits >= $amount;
    }

    public function deductCredits($amount = 1)
    {
        $this->credits -= $amount;
        $this->save();
        return $this;
    }

    public function addCredits($amount)
    {
        $this->credits += $amount;
        $this->save();
        return $this;
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}