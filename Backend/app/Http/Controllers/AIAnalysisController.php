<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\History;
use App\Models\UsageLog;
use App\Services\AIDetectionService;
use App\Services\TextHumanizerService;
use App\Services\PlagiarismCheckService;
use App\Services\ReadabilityService;
use App\Services\IterativeRewriteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AIAnalysisController extends Controller
{
    protected $detectionService;
    protected $humanizerService;
    protected $plagiarismService;
    protected $readabilityService;
    protected $iterativeService;

    public function __construct(
        AIDetectionService $detectionService,
        TextHumanizerService $humanizerService,
        PlagiarismCheckService $plagiarismService,
        ReadabilityService $readabilityService,
        IterativeRewriteService $iterativeService
    ) {
        $this->detectionService = $detectionService;
        $this->humanizerService = $humanizerService;
        $this->plagiarismService = $plagiarismService;
        $this->readabilityService = $readabilityService;
        $this->iterativeService = $iterativeService;
    }

    public function analyze(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'text' => 'required|string|min:10|max:50000',
                'action' => 'required|in:detect,humanize,both',
                'style' => 'sometimes|string',
                'strength' => 'sometimes|string',
                'length' => 'sometimes|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if (!$user->hasEnoughCredits()) {
                return response()->json([
                    'error' => 'Insufficient credits',
                    'credits_needed' => 1,
                    'credits_available' => $user->credits
                ], 402);
            }

            $startTime = microtime(true);
            $result = [];
            $originalText = $request->text;
            $action = $request->action;
            $style = $request->input('style', 'casual');

            DB::beginTransaction();

            $analysis = Analysis::create([
                'user_id' => $user->id,
                'original_text' => $originalText,
                'status' => 'processing',
                'word_count' => str_word_count($originalText)
            ]);

            // 1. AI Detection
            if ($action === 'detect' || $action === 'both') {
                try {
                    $detectionResult = $this->detectionService->detect($originalText);
                    $result['detection'] = $detectionResult;
                    
                    $analysis->ai_score = $detectionResult['ai_score'];
                    $analysis->human_score = 1 - $detectionResult['ai_score'];
                    $analysis->confidence = $detectionResult['confidence'];
                    $analysis->indicators = $detectionResult['indicators'] ?? [];
                    $analysis->detection_method = $detectionResult['method'] ?? 'unknown';
                } catch (\Exception $e) {
                    Log::warning('Detection failed: ' . $e->getMessage());
                    $result['detection'] = [
                        'ai_score' => 0.5,
                        'confidence' => 0.3,
                        'indicators' => ['Detection temporarily unavailable'],
                        'method' => 'fallback'
                    ];
                    $analysis->ai_score = 0.5;
                    $analysis->confidence = 0.3;
                    $analysis->indicators = ['Detection temporarily unavailable'];
                    $analysis->detection_method = 'fallback';
                }
            }

            // 2. AI Humanization
            if ($action === 'humanize' || $action === 'both') {
                try {
                    $humanized = $this->humanizerService->humanize($originalText, $style);
                    $result['humanized'] = $humanized;
                    $analysis->processed_text = $humanized;
                    $result['original_text'] = $originalText;
                } catch (\Exception $e) {
                    Log::warning('Humanization failed: ' . $e->getMessage());
                    $result['humanized'] = $originalText;
                    $result['original_text'] = $originalText;
                    $analysis->processed_text = $originalText;
                    $result['humanization_fallback'] = true;
                }
            }

            // 3. Plagiarism Check
            try {
                $plagiarismResult = $this->plagiarismService->check($originalText);
                $result['plagiarism'] = $plagiarismResult;
            } catch (\Exception $e) {
                Log::warning('Plagiarism check failed: ' . $e->getMessage());
                $result['plagiarism'] = ['score' => 0, 'status' => 'Check unavailable'];
            }

            // 4. Readability Analysis
            try {
                $readabilityResult = $this->readabilityService->analyze($originalText);
                $result['readability'] = $readabilityResult;
            } catch (\Exception $e) {
                Log::warning('Readability analysis failed: ' . $e->getMessage());
                $result['readability'] = ['error' => 'Analysis unavailable'];
            }

            // 5. Iterative Rewriting (if humanized)
            if (isset($result['humanized']) && ($action === 'humanize' || $action === 'both')) {
                try {
                    $iterativeResult = $this->iterativeService->rewrite(
                        $result['humanized'],
                        $style,
                        1
                    );
                    $result['iterative'] = $iterativeResult;
                } catch (\Exception $e) {
                    Log::warning('Iterative rewrite failed: ' . $e->getMessage());
                    $result['iterative'] = ['error' => 'Rewrite unavailable'];
                }
            }

            $analysis->status = 'completed';
            $analysis->processing_time = round((microtime(true) - $startTime) * 1000);
            $analysis->save();

            // Save to History
            History::create([
                'user_id' => $user->id,
                'action' => $action,
                'original_text' => $originalText,
                'result_text' => $result['humanized'] ?? null,
                'ai_score' => $result['detection']['ai_score'] ?? null
            ]);

            // ✅ NEW: Keep only the most recent 5 history records per user
            $historyIds = History::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->pluck('id');

            if ($historyIds->count() > 5) {
                // Delete all history IDs after the first 5
                History::whereIn('id', $historyIds->slice(5)->values())->delete();
            }

            $user->deductCredits();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $result,
                'analysis_id' => $analysis->id,
                'credits_remaining' => $user->credits,
                'processing_time' => $analysis->processing_time
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Analyze failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Analysis temporarily unavailable. Please try again in a moment.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $history = Analysis::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->limit(5) // ✅ Only fetch the latest 5 records
                ->get();

            return response()->json(['data' => $history]);
        } catch (\Exception $e) {
            return response()->json(['data' => []]);
        }
    }

    public function show($id)
    {
        try {
            $analysis = Analysis::where('user_id', auth()->id())->findOrFail($id);
            return response()->json($analysis);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Analysis not found'], 404);
        }
    }

    public function compare($id)
    {
        try {
            $analysis = Analysis::where('user_id', auth()->id())->findOrFail($id);
            $original = explode(' ', $analysis->original_text);
            $processed = explode(' ', $analysis->processed_text ?? '');
            
            return response()->json([
                'analysis' => $analysis,
                'comparison' => [
                    'original_word_count' => count($original),
                    'processed_word_count' => count($processed),
                    'change_percentage' => count($original) > 0 
                        ? abs(count($processed) - count($original)) / count($original) * 100 
                        : 0
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Analysis not found'], 404);
        }
    }
}