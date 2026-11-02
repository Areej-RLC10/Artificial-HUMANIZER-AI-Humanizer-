<?php

use Illuminate\Support\Facades\Route;

Route::get('/test2', function () {
    return response()->json(['message' => 'API2 is working!']);
});

Route::post('/analyze2', function () {
    return response()->json(['message' => 'Analyze2 is working!']);
});
