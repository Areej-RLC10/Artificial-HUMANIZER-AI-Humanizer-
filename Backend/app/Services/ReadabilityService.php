<?php

namespace App\Services;

class ReadabilityService
{
    public function analyze($text)
    {
        $fleschScore = $this->calculateFlesch($text);
        $fleschKincaid = $this->calculateFleschKincaid($text);
        $smog = $this->calculateSmog($text);
        $colemanLiau = $this->calculateColemanLiau($text);
        
        $averageGrade = ($fleschKincaid + $smog + $colemanLiau) / 3;
        
        return [
            'flesch_reading_ease' => [
                'score' => $fleschScore,
                'level' => $this->getFleschLevel($fleschScore)
            ],
            'flesch_kincaid_grade' => round($fleschKincaid, 1),
            'smog_index' => round($smog, 1),
            'coleman_liau_index' => round($colemanLiau, 1),
            'average_grade_level' => round($averageGrade, 1),
            'word_count' => str_word_count($text),
            'sentence_count' => count(preg_split('/[.!?]+/', $text)),
            'syllable_count' => $this->countSyllables($text),
            'complex_word_count' => $this->countComplexWords($text),
            'readability_summary' => $this->getReadabilitySummary($averageGrade),
            'suggestions' => $this->getSuggestions($text, $averageGrade)
        ];
    }

    private function calculateFlesch($text)
    {
        $words = str_word_count($text);
        $sentences = count(preg_split('/[.!?]+/', $text));
        $syllables = $this->countSyllables($text);
        
        if ($sentences === 0 || $words === 0) return 0;
        
        // Flesch Reading Ease = 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
        return max(0, 206.835 - (1.015 * ($words / $sentences)) - (84.6 * ($syllables / $words)));
    }

    private function calculateFleschKincaid($text)
    {
        $words = str_word_count($text);
        $sentences = count(preg_split('/[.!?]+/', $text));
        $syllables = $this->countSyllables($text);
        
        if ($sentences === 0 || $words === 0) return 0;
        
        // Flesch-Kincaid Grade Level = 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
        return max(0, 0.39 * ($words / $sentences) + 11.8 * ($syllables / $words) - 15.59);
    }

    private function calculateSmog($text)
    {
        $sentences = preg_split('/[.!?]+/', $text);
        $totalSentences = count($sentences);
        
        if ($totalSentences < 3) return 0;
        
        // Count words with 3+ syllables
        $complexWords = 0;
        foreach ($sentences as $sentence) {
            $words = str_word_count($sentence, 1);
            foreach ($words as $word) {
                if ($this->countSyllables($word) >= 3) {
                    $complexWords++;
                }
            }
        }
        
        // SMOG = 1.043 * sqrt(complex_words * (30 / total_sentences)) + 3.1291
        return max(0, 1.043 * sqrt($complexWords * (30 / $totalSentences)) + 3.1291);
    }

    private function calculateColemanLiau($text)
    {
        $words = str_word_count($text);
        $sentences = count(preg_split('/[.!?]+/', $text));
        
        if ($sentences === 0 || $words === 0) return 0;
        
        // Coleman-Liau = 5.89*(characters/words) - 0.3*(sentences/words) - 15.8
        $letters = strlen(preg_replace('/[^a-zA-Z]/', '', $text));
        return max(0, 5.89 * ($letters / $words) - 0.3 * ($sentences / $words) - 15.8);
    }

    private function countSyllables($word)
    {
        $word = strtolower(trim($word));
        if (empty($word)) return 0;
        
        // Simple syllable counter (approximate)
        $count = preg_match_all('/[aeiouy]+/', $word, $matches);
        
        // Deduct 1 for silent e at end
        if (substr($word, -1) === 'e' && $count > 1) {
            $count--;
        }
        
        return max(1, $count);
    }

    private function countComplexWords($text)
    {
        $words = str_word_count($text, 1);
        $complex = 0;
        foreach ($words as $word) {
            if ($this->countSyllables($word) >= 3) {
                $complex++;
            }
        }
        return $complex;
    }

    private function getFleschLevel($score)
    {
        if ($score >= 90) return 'Very Easy (5th grade)';
        if ($score >= 80) return 'Easy (6th grade)';
        if ($score >= 70) return 'Fairly Easy (7th grade)';
        if ($score >= 60) return 'Plain English (8th-9th grade)';
        if ($score >= 50) return 'Fairly Difficult (10th-12th grade)';
        if ($score >= 30) return 'Difficult (College level)';
        return 'Very Difficult (Graduate level)';
    }

    private function getReadabilitySummary($grade)
    {
        if ($grade <= 5) return 'Very simple text, suitable for children';
        if ($grade <= 8) return 'Easy to read, suitable for general audience';
        if ($grade <= 10) return 'Moderate difficulty, suitable for high school students';
        if ($grade <= 13) return 'Somewhat complex, suitable for college students';
        return 'Complex text, suitable for graduate-level readers';
    }

    private function getSuggestions($text, $grade)
    {
        $suggestions = [];
        
        if ($grade > 12) {
            $suggestions[] = 'Consider using shorter sentences for better readability';
            $suggestions[] = 'Replace complex words with simpler alternatives';
            $suggestions[] = 'Break down long paragraphs into smaller chunks';
        }
        
        if ($grade > 9 && $grade <= 12) {
            $suggestions[] = 'Try to vary sentence length for better flow';
            $suggestions[] = 'Use more common vocabulary where appropriate';
        }
        
        if ($grade <= 9) {
            $suggestions[] = 'Text is easily readable - good for general audiences';
        }
        
        // Additional suggestions based on content analysis
        if (strpos($text, 'in conclusion') !== false) {
            $suggestions[] = 'Avoid overused conclusion phrases like "in conclusion"';
        }
        
        if (str_word_count($text) < 100) {
            $suggestions[] = 'Adding more content could improve context and clarity';
        }
        
        return $suggestions;
    }
}
