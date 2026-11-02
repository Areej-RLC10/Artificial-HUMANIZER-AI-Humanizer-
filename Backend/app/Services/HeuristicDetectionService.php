<?php

namespace App\Services;

class HeuristicDetectionService
{
    public function detect($text)
    {
        $score = 0;
        $indicators = [];
        $confidence = 0;

        // 1. Repetition Analysis
        $repetitionScore = $this->analyzeRepetition($text);
        if ($repetitionScore > 0.3) {
            $score += 0.2;
            $indicators[] = 'High repetition detected';
            $confidence += 0.15;
        }

        // 2. Sentence Structure Analysis
        $structureScore = $this->analyzeSentenceStructure($text);
        if ($structureScore['variance'] < 0.3) {
            $score += 0.15;
            $indicators[] = 'Consistent sentence patterns';
            $confidence += 0.15;
        }

        // 3. Vocabulary Diversity
        $diversityScore = $this->calculateVocabularyDiversity($text);
        if ($diversityScore < 0.4) {
            $score += 0.15;
            $indicators[] = 'Limited vocabulary range';
            $confidence += 0.15;
        }

        // 4. Common AI Patterns
        $patternScore = $this->detectAIPatterns($text);
        if ($patternScore > 0) {
            $score += $patternScore;
            $confidence += 0.2;
        }

        // 5. Perplexity Analysis
        $perplexityScore = $this->calculatePerplexity($text);
        if ($perplexityScore < 0.5) {
            $score += 0.15;
            $indicators[] = 'Low linguistic perplexity';
            $confidence += 0.15;
        }

        // Normalize scores
        $finalScore = min($score, 0.95);
        $finalConfidence = min($confidence + 0.3, 0.95);

        return [
            'score' => $finalScore,
            'confidence' => $finalConfidence,
            'indicators' => array_slice($indicators, 0, 5),
            'method' => 'heuristic'
        ];
    }

    private function analyzeRepetition($text)
    {
        $words = str_word_count(strtolower($text), 1);
        if (empty($words)) return 0;

        $unique = array_unique($words);
        return (count($words) - count($unique)) / count($words);
    }

    private function analyzeSentenceStructure($text)
    {
        $sentences = preg_split('/[.!?]+/', $text);
        $sentences = array_filter($sentences, fn($s) => trim($s) !== '');

        if (count($sentences) < 2) {
            return ['variance' => 1, 'avg_length' => 0];
        }

        $lengths = array_map('strlen', $sentences);
        $avg = array_sum($lengths) / count($lengths);

        $variance = array_reduce($lengths, function($carry, $len) use ($avg) {
            return $carry + pow($len - $avg, 2);
        }, 0) / count($lengths);

        return [
            'variance' => sqrt($variance) / max($avg, 1),
            'avg_length' => $avg
        ];
    }

    private function calculateVocabularyDiversity($text)
    {
        $words = str_word_count(strtolower($text), 1);
        if (empty($words)) return 0;

        $unique = array_unique($words);
        return count($unique) / count($words);
    }

    private function detectAIPatterns($text)
    {
        // Pulled from config/ai_patterns.php — the same list TextHumanizerService
        // tells the model to avoid, so detection and humanization never drift apart.
        $patterns = config('ai_patterns.phrases', []);

        $score = 0;
        foreach ($patterns as $pattern => $weight) {
            if (stripos($text, $pattern) !== false) {
                $score += $weight;
            }
        }

        return min($score, 0.75);
    }

    private function calculatePerplexity($text)
    {
        $words = explode(' ', strtolower($text));
        $trigrams = [];

        for ($i = 0; $i < count($words) - 2; $i++) {
            $trigrams[] = "{$words[$i]} {$words[$i+1]} {$words[$i+2]}";
        }

        if (empty($trigrams)) return 0.5;

        $unique_trigrams = array_unique($trigrams);
        return count($unique_trigrams) / count($trigrams);
    }
}