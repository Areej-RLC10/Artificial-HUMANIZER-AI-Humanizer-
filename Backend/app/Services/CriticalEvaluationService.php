<?php

namespace App\Services;

class CriticalEvaluationService
{
    /**
     * Critical evaluation layer.
     * Treats detection as a signal, not a verdict, and reduces false positives.
     */
    public function evaluate(array $mlResult, array $statisticalResult): array
    {
        $combinedScore = $this->combineScores($mlResult['score'] ?? 0, $statisticalResult['score'] ?? 0);
        $confidence = min(0.99, 0.5 + ($combinedScore * 0.45));

        $indicators = array_values(array_unique(array_merge(
            $mlResult['indicators'] ?? [],
            $statisticalResult['indicators'] ?? []
        )));

        return [
            'score' => round($combinedScore, 4),
            'confidence' => round($confidence, 4),
            'indicators' => $indicators,
            'warning' => 'Detection score is a signal, not a final verdict; cross-check with context and source material.',
            'method' => 'critical_evaluation',
        ];
    }

    protected function combineScores(float $mlScore, float $statisticalScore): float
    {
        $weightedMl = 0.6;
        $weightedStat = 0.4;

        $combined = ($weightedMl * $mlScore) + ($weightedStat * $statisticalScore);

        return min(1.0, max(0.0, $combined));
    }
}
