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
        $mlResult = $this->mlDetectionService->detect($text);
        $statResult = $this->statisticalDetectionService->detect($text);
        $evaluated = $this->criticalEvaluationService->evaluate($mlResult, $statResult);

        $groqResult = $this->openAIService->detectAIContent($text);
        $heuristic = $this->heuristicService->detect($text);

        $finalScore = $evaluated['score'];
        $finalConfidence = $evaluated['confidence'];
        $finalIndicators = $evaluated['indicators'];
        $method = 'hybrid';

        if ($groqResult) {
            $combinedScore = ($finalScore * 0.7) + ($groqResult['score'] * 0.3);
            $finalScore = min(1.0, max(0.0, $combinedScore));
            $finalConfidence = max($finalConfidence, $groqResult['confidence'] ?? 0.5);
            $finalIndicators = array_values(array_unique(array_merge($finalIndicators, $groqResult['indicators'] ?? [])));
            $method = 'hybrid_ml_statistical_groq';
        }

        if ($heuristic && $finalScore < 0.5 && ($heuristic['score'] ?? 0) >= 0.55) {
            $finalScore = max($finalScore, min(0.9, $heuristic['score'] + 0.1));
            $finalConfidence = max($finalConfidence, $heuristic['confidence'] ?? 0.5);
            $finalIndicators = array_values(array_unique(array_merge($finalIndicators, $heuristic['indicators'] ?? [])));
        }

        return [
            'ai_score' => round($finalScore, 4),
            'confidence' => round($finalConfidence, 4),
            'indicators' => $finalIndicators,
            'method' => $method,
            'warning' => $evaluated['warning'] ?? null,
            'detected_at' => now()->toIso8601String(),
        ];
    }
}
