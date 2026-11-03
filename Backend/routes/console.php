<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ✅ Schedule the daily credit reset at midnight (Nepal time)
Schedule::command('credits:reset')
    ->dailyAt('23:45')  // Nepal midnight (adjusting for server UTC)
    ->onSuccess(function () {
        \Log::info('✅ Daily credits reset completed successfully');
    })
    ->onFailure(function () {
        \Log::error('❌ Daily credits reset failed');
    });