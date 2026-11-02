<?php

use App\Http\Controllers\AIAnalysisController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/analyze', [AIAnalysisController::class, 'analyze']);
    Route::get('/history', [AIAnalysisController::class, 'history']);
    Route::get('/analysis/{id}', [AIAnalysisController::class, 'show']);
    Route::get('/analysis/{id}/compare', [AIAnalysisController::class, 'compare']);
});