<?php

namespace App\Http\Controllers;

use App\Services\AIDetectionService;
use App\Services\TextHumanizerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AnonymousTryController extends Controller
{
    private const MAX_WORDS = 300;
    private const TRIES_PER_IP = 3;       // per rolling 24 hours
    private const GLOBAL_DAILY_CAP = 200; // emergency limit across all visitors

    public function __construct(
        protected AIDetectionService $detectionService,
        protected TextHumanizerService $humanizerService
    ) {
    }

    public function run(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|min:10|max:6000',
            'mode' => 'required|in:humanize,detect',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $text = trim($request->input('text'));
        $words = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);

        if (count($words) > self::MAX_WORDS) {
            return response()->json([
                'message' => 'Free tries are limited to ' . self::MAX_WORDS . ' words. Sign up for longer texts.',
            ], 422);
        }

        $ipKey = 'anon_try:ip:' . sha1($this->clientIp($request));
        $globalKey = 'anon_try:global:' . now()->format('Y-m-d');

        // Reserve a try before the slow API call so parallel requests cannot slip past the limit.
        $ipCount = $this->bump($ipKey);
        $globalCount = $this->bump($globalKey);

        if ($globalCount > self::GLOBAL_DAILY_CAP) {
            $this->refund($ipKey);
            $this->refund($globalKey);
            return response()->json([
                'message' => 'Free tries are at capacity today.',
                'remaining' => 0,
            ], 429);
        }

        if ($ipCount > self::TRIES_PER_IP) {
            $this->refund($ipKey);
            $this->refund($globalKey);
            return response()->json([
                'message' => "You've used today's free tries.",
                'remaining' => 0,
            ], 429);
        }

        try {
            if ($request->input('mode') === 'detect') {
                $detection = $this->detectionService->detect($text);
                $payload = ['ai_score' => (float) ($detection['ai_score'] ?? 0.5)];
            } else {
                $payload = ['humanized_text' => $this->humanizerService->humanize($text, 'casual')];
            }
        } catch (\Throwable $e) {
            Log::warning('Anonymous try failed: ' . $e->getMessage());
            $this->refund($ipKey);
            $this->refund($globalKey);
            return response()->json([
                'message' => 'The service is busy right now. Please try again in a moment.',
            ], 503);
        }

        return response()->json($payload + [
            'remaining' => max(0, self::TRIES_PER_IP - $ipCount),
        ]);
    }

    private function clientIp(Request $request): string
    {
        // Render sits behind Cloudflare, which sets this header to the real visitor IP.
        // X-Forwarded-For can be faked by the client, so it is deliberately not used.
        $cf = $request->header('CF-Connecting-IP');

        if ($cf && filter_var($cf, FILTER_VALIDATE_IP)) {
            return $cf;
        }

        return (string) $request->ip();
    }

    private function bump(string $key): int
    {
        Cache::add($key, 0, now()->addDay());

        return (int) Cache::increment($key);
    }

    private function refund(string $key): void
    {
        if ((int) Cache::get($key, 0) > 0) {
            Cache::decrement($key);
        }
    }
}
