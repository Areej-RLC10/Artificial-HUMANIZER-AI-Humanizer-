<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AIDetectionService
{
    protected $openAIService;
    protected $heuristicService;
    protected $mlDetectionService;
    protected $statisticalDetectionService;
    protected $criticalEvaluationService;

    public function __construct(
        OpenAIService $openAIService,
        HeuristicDetectionService $heuristicService,
        MLDetectionService $mlDetectionService,
        StatisticalDetectionService $statisticalDetectionService,
        CriticalEvaluationService $criticalEvaluationService
    ) {
        $this->openAIService = $openAIService;
        $this->heuristicService = $heuristicService;
        $this->mlDetectionService = $mlDetectionService;
        $this->statisticalDetectionService = $statisticalDetectionService;
        $this->criticalEvaluationService = $criticalEvaluationService;
    }

    public function detect($text)
    {
        // 1. Run the core detection layers
        $mlResult = $this->mlDetectionService->detect($text);
        $statResult = $this->statisticalDetectionService->detect($text);
        $evaluated = $this->criticalEvaluationService->evaluate($mlResult, $statResult);

        $groqResult = $this->openAIService->detectAIContent($text);
        $heuristic = $this->heuristicService->detect($text);

        $finalScore = $evaluated['score'];
        $finalConfidence = $evaluated['confidence'];
        $finalIndicators = $evaluated['indicators'];
        $method = 'hybrid';

        // 2. Blend with Groq results
        if ($groqResult) {
            $combinedScore = ($finalScore * 0.7) + ($groqResult['score'] * 0.3);
            $finalScore = min(1.0, max(0.0, $combinedScore));
            $finalConfidence = max($finalConfidence, $groqResult['confidence'] ?? 0.5);
            $finalIndicators = array_values(array_unique(array_merge($finalIndicators, $groqResult['indicators'] ?? [])));
            $method = 'hybrid_ml_statistical_groq';
        }

        // 3. Blend with Heuristic results
        if ($heuristic && $finalScore < 0.5 && ($heuristic['score'] ?? 0) >= 0.55) {
            $finalScore = max($finalScore, min(0.9, $heuristic['score'] + 0.1));
            $finalConfidence = max($finalConfidence, $heuristic['confidence'] ?? 0.5);
            $finalIndicators = array_values(array_unique(array_merge($finalIndicators, $heuristic['indicators'] ?? [])));
        }

        // --- NEW: SENTENCE-BY-SENTENCE HIGHLIGHTING ---
        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $highlighted_sentences = [];
        
        foreach ($sentences as $sentence) {
            // Start with the overall document score as the base
            $sentenceScore = $finalScore; 
            
            // Penalize sentences with common AI transition phrases
            if (preg_match('/\b(in conclusion|moreover|furthermore|therefore|it is important to note|additionally)\b/i', $sentence)) {
                $sentenceScore += 0.25; 
            }
            
            // Very short sentences are usually human-like (burstiness)
            if (strlen($sentence) < 60) {
                $sentenceScore -= 0.15;
            }
            
            // Clamp the score between 0 and 1
            $sentenceScore = min(1.0, max(0.0, $sentenceScore));

            // Categorize for the frontend colors
            if ($sentenceScore > 0.7) {
                $category = 'surely_ai';
            } elseif ($sentenceScore > 0.4) {
                $category = 'likely_ai';
            } elseif ($sentenceScore > 0.2) {
                $category = 'mixed';
            } else {
                $category = 'human';
            }

            $highlighted_sentences[] = [
                'text' => trim($sentence),
                'category' => $category,
                'score' => round($sentenceScore * 100)
            ];
        }

        // 4. Return the final payload
        return [
            'ai_score' => round($finalScore, 4),
            'confidence' => round($finalConfidence, 4),
            'indicators' => $finalIndicators,
            'method' => $method,
            'sentences' => $highlighted_sentences, // ✅ Send to frontend
            'warning' => $evaluated['warning'] ?? 'Detection score is a signal, not a final verdict.',
            'detected_at' => now()->toIso8601String(),
        ];
    }
}