<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\OpenAIService;

class AIServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind('App\Services\OpenAIService', function ($app) {
            return new OpenAIService();
        });
    }

    public function boot()
    {
        //
    }
}
