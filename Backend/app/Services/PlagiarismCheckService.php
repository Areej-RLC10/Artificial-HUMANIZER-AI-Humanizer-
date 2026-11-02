<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlagiarismCheckService
{
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        // Using a free API or local detection
        $this->apiKey = env('PLAGIARISM_API_KEY', null);
        $this->apiUrl = 'https://api.duplichecker.com/v1/';
    }

    public function check($text)
    {
        // Method 1: Local fingerprinting (no API key needed)
        $localResult = $this->localCheck($text);
        
        // Method 2: External API (if key provided)
        if ($this->apiKey) {
            try {
                $apiResult = $this->apiCheck($text);
                return $this->combineResults($localResult, $apiResult);
            } catch (\Exception $e) {
                Log::warning('External plagiarism API failed: ' . $e->getMessage());
            }
        }
        
        return $localResult;
    }

    private function localCheck($text)
    {
        // Simple local fingerprinting
        $sentences = preg_split('/[.!?]+/', $text);
        $sentences = array_filter(array_map('trim', $sentences));
        
        $totalSentences = count($sentences);
        $uniqueSentences = count(array_unique($sentences));
        
        // Calculate similarity score (higher = more likely plagiarized)
        $duplicateRatio = ($totalSentences - $uniqueSentences) / max($totalSentences, 1);
        
        // Check for common phrases (simple fingerprint)
        $commonPhrases = [
            'in conclusion' => 0.05,
            'it is important' => 0.04,
            'as a result' => 0.03,
            'therefore' => 0.03,
            'furthermore' => 0.03,
            'moreover' => 0.03,
            'consequently' => 0.03,
            'additionally' => 0.03,
        ];
        
        $phraseScore = 0;
        foreach ($commonPhrases as $phrase => $weight) {
            if (stripos($text, $phrase) !== false) {
                $phraseScore += $weight;
            }
        }
        
        // Combined score (0-1)
        $score = min(($duplicateRatio * 0.6) + ($phraseScore * 0.4), 1);
        
        return [
            'score' => $score,
            'unique_sentences' => $uniqueSentences,
            'total_sentences' => $totalSentences,
            'duplicate_ratio' => $duplicateRatio,
            'flagged_phrases' => $this->getFlaggedPhrases($text),
            'status' => $this->getStatus($score),
            'method' => 'local'
        ];
    }

    private function apiCheck($text)
    {
        // Example API call (replace with actual API)
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey
        ])->post($this->apiUrl . 'check', [
            'text' => $text
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'score' => $data['plagiarism_percentage'] ?? 0.5,
                'sources' => $data['sources'] ?? [],
                'method' => 'api'
            ];
        }

        throw new \Exception('API request failed');
    }

    private function combineResults($local, $api)
    {
        return [
            'score' => ($local['score'] + $api['score']) / 2,
            'local' => $local,
            'api' => $api,
            'method' => 'combined'
        ];
    }

    private function getFlaggedPhrases($text)
    {
        $flagged = [];
        $commonPhrases = [
            'in conclusion' => 'Common academic conclusion phrase',
            'it is important to note' => 'Generic academic filler',
            'as previously mentioned' => 'Formulaic repetition',
            'furthermore' => 'Standard transition word',
            'moreover' => 'Formal additive transition',
            'therefore' => 'Formal conclusion marker',
            'consequently' => 'Formal consequence marker',
            'additionally' => 'Formal additive transition',
        ];

        foreach ($commonPhrases as $phrase => $description) {
            if (stripos($text, $phrase) !== false) {
                $flagged[] = [
                    'phrase' => $phrase,
                    'description' => $description,
                    'suggestion' => $this->getSuggestion($phrase)
                ];
            }
        }

        return array_slice($flagged, 0, 5);
    }

    private function getSuggestion($phrase)
    {
        $suggestions = [
            'in conclusion' => 'Try: "To summarize" or "In summary"',
            'it is important to note' => 'Try: "Note that" or "Keep in mind"',
            'as previously mentioned' => 'Try: "As noted" or "Earlier we discussed"',
            'furthermore' => 'Try: "Also" or "Additionally" (sparingly)',
            'moreover' => 'Try: "Also" or "Beyond that"',
            'therefore' => 'Try: "Thus" or "So"',
            'consequently' => 'Try: "As a result" or "Thus"',
            'additionally' => 'Try: "Also" or "In addition" (sparingly)',
        ];

        return $suggestions[$phrase] ?? 'Consider rephrasing with a more natural alternative';
    }

    private function getStatus($score)
    {
        if ($score > 0.7) return 'High plagiarism detected';
        if ($score > 0.4) return 'Moderate plagiarism detected';
        return 'Low plagiarism detected';
    }
}