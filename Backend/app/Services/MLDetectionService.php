<?php

namespace App\Services;

class MLDetectionService
{
    /**
     * Detect AI-generated text using an ML-based model layer.
     * This is a blueprint for a RoBERTa-style classifier or transformer model.
     */
    public function detect(string $text): array
    {
        $score = $this->calculateScore($text);

        return [
            'score' => round($score, 4),
            'confidence' => 0.7,
            'indicators' => $this->getIndicators($text),
            'method' => 'ml',
        ];
    }

    protected function calculateScore(string $text): float
    {
        $normalized = trim($text);

        if ($normalized === '') {
            return 0.0;
        }

        $wordCount = str_word_count($normalized);
        $lengthFactor = min(1, $wordCount / 150);
        $patternFactor = $this->detectPatternSignals($normalized);

        return min(1.0, (0.45 * $lengthFactor) + (0.55 * $patternFactor));
    }

    protected function detectPatternSignals(string $text): float
    {
        $signals = [
            'in conclusion',
            'therefore',
            'moreover',
            'additionally',
            'it is essential',
            'overall',
            'in summary',
            'as a result',
            'one major concern',
            'it should be noted',
        ];

        $hits = 0;
        foreach ($signals as $signal) {
            if (stripos($text, $signal) !== false) {
                $hits++;
            }
        }

        return min(1.0, $hits / 5);
    }

    protected function getIndicators(string $text): array
    {
        $indicators = [];

        if (preg_match('/\b(in conclusion|therefore|moreover|additionally)\b/i', $text)) {
            $indicators[] = 'Structured transition phrases detected';
        }

        if (str_word_count($text) > 200) {
            $indicators[] = 'Long-form pattern density suggests generated structure';
        }

        return $indicators ?: ['ML text pattern analysis completed'];
    }
}
