<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckCreditsMiddleware
{
    public function handle(Request $request, Closure $next, $minCredits = 1)
    {
        $user = $request->user();
        
        if (!$user || $user->credits < $minCredits) {
            return response()->json([
                'error' => 'Insufficient credits',
                'credits_available' => $user ? $user->credits : 0,
                'credits_needed' => $minCredits
            ], 402);
        }

        return $next($request);
    }
}