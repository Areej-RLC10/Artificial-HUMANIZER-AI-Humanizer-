<?php

use App\Http\Controllers\AIAnalysisController;
use App\Http\Controllers\AnonymousTryController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});

// Public free trial: limited by word count, per-IP tries and a global daily cap
Route::post('/try', [AnonymousTryController::class, 'run']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/analyze', [AIAnalysisController::class, 'analyze']);
    Route::get('/history', [AIAnalysisController::class, 'history']);
    Route::get('/analysis/{id}', [AIAnalysisController::class, 'show']);
    Route::get('/analysis/{id}/compare', [AIAnalysisController::class, 'compare']);
});
