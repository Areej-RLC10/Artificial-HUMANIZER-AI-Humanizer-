<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class IterativeRewriteService
{
    protected $humanizerService;

    public function __construct(TextHumanizerService $humanizerService)
    {
        $this->humanizerService = $humanizerService;
    }

    public function rewrite($text, $style = 'casual', $iterations = 1)
    {
        $original = $text;
        $rewritten = $text;
        $changes = [];

        for ($i = 0; $i < $iterations; $i++) {
            $previous = $rewritten;
            $rewritten = $this->humanizerService->humanize($rewritten, $style);
            
            // Track changes
            $changes[] = [
                'iteration' => $i + 1,
                'word_count' => str_word_count($rewritten),
                'word_count_change' => str_word_count($rewritten) - str_word_count($previous),
                'similarity' => $this->calculateSimilarity($previous, $rewritten)
            ];

            // Stop if converged
            if ($previous === $rewritten) {
                break;
            }
        }

        return [
            'original' => $original,
            'final' => $rewritten,
            'iterations' => count($changes),
            'changes' => $changes,
            'improvement_ratio' => $this->calculateImprovement($original, $rewritten)
        ];
    }

    private function calculateSimilarity($text1, $text2)
    {
        $words1 = explode(' ', strtolower($text1));
        $words2 = explode(' ', strtolower($text2));
        
        $intersection = array_intersect($words1, $words2);
        $union = array_unique(array_merge($words1, $words2));
        
        return count($union) > 0 ? count($intersection) / count($union) : 0;
    }

    private function calculateImprovement($original, $rewritten)
    {
        // Measure changes in word count, structure, etc.
        $originalWords = explode(' ', $original);
        $rewrittenWords = explode(' ', $rewritten);
        
        $wordDiff = abs(count($originalWords) - count($rewrittenWords));
        $maxWords = max(count($originalWords), count($rewrittenWords), 1);
        
        // Some improvement if words changed
        $changeRatio = $wordDiff / $maxWords;
        
        // Also check for unique words
        $originalUnique = count(array_unique($originalWords));
        $rewrittenUnique = count(array_unique($rewrittenWords));
        $uniqueDiff = abs($originalUnique - $rewrittenUnique);
        $maxUnique = max($originalUnique, $rewrittenUnique, 1);
        $uniqueRatio = $uniqueDiff / $maxUnique;
        
        return min(($changeRatio + $uniqueRatio) / 2, 1);
    }
}