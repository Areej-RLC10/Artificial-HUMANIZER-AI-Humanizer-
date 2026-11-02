<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/login', function () {
    return response()->json(['message' => 'Login required'], 401);
})->name('login');

Route::post('/analyze', function () {
    return response()->json(['message' => 'API from web.php works!']);
});

Route::get('/health', function () {
    return response()->json(['status' => 'healthy from web.php']);
});
