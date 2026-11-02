<?php

namespace App\Services;

class StatisticalDetectionService
{
    /**
     * Statistical layer for AI detection.
     * Uses perplexity-like and burstiness-like indicators to measure textual predictability.
     */
    public function detect(string $text): array
    {
        $words = preg_split('/\s+/', trim($text));

        if (empty($words)) {
            return [
                'score' => 0.0,
                'confidence' => 0.0,
                'indicators' => ['No text available for statistical analysis'],
                'method' => 'statistics',
            ];
        }

        $perplexity = $this->calculatePerplexity($words);
        $burstiness = $this->calculateBurstiness($words);
        $score = $this->combineScores($perplexity, $burstiness);

        return [
            'score' => round($score, 4),
            'confidence' => round(min(0.95, 0.55 + ($score * 0.4)), 4),
            'indicators' => $this->getIndicators($perplexity, $burstiness),
            'method' => 'statistics',
        ];
    }

    protected function calculatePerplexity(array $words): float
    {
        $ngrams = [];
        $total = count($words);

        for ($i = 0; $i <= $total - 2; $i++) {
            $ngrams[] = strtolower($words[$i] . ' ' . $words[$i + 1]);
        }

        if (empty($ngrams)) {
            return 0.5;
        }

        $unique = array_unique($ngrams);
        return count($unique) / count($ngrams);
    }

    protected function calculateBurstiness(array $words): float
    {
        $lengths = array_map('strlen', $words);
        $avg = array_sum($lengths) / count($lengths);
        $variance = 0;

        foreach ($lengths as $length) {
            $variance += pow($length - $avg, 2);
        }

        $variance /= count($lengths);
        $stdDev = sqrt($variance);

        return min(1.0, $stdDev / max($avg, 1));
    }

    protected function combineScores(float $perplexity, float $burstiness): float
    {
        $perplexityWeight = 0.55;
        $burstinessWeight = 0.45;

        $score = ($perplexityWeight * $perplexity) + ($burstinessWeight * $burstiness);

        return min(1.0, max(0.0, $score));
    }

    protected function getIndicators(float $perplexity, float $burstiness): array
    {
        $indicators = [];

        if ($perplexity < 0.5) {
            $indicators[] = 'Lower token variation suggests more predictable text';
        }

        if ($burstiness < 0.4) {
            $indicators[] = 'Sentence rhythm is unusually stable';
        }

        return $indicators ?: ['Statistical text distribution appears normal'];
    }
}
