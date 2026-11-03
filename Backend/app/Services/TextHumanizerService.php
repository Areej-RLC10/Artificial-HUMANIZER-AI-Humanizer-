<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class TextHumanizerService
{
    protected $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    public function humanize($text, $style = 'casual')
    {
        // 1. Try to use the Groq AI API
        $result = $this->openAIService->humanizeText($text, $style);

        $reason = null;
        
        // 2. Check if the AI failed or returned text that is too similar
        if (!$result) {
            $reason = 'groq_failed_or_returned_null';
        } elseif (trim($result) === trim($text)) {
            $reason = 'identical_text';
        } elseif ($this->tooSimilar($text, $result)) {
            $reason = 'too_similar';
        }

        // 3. If it failed, use the strong fallback
        if ($reason) {
            Log::warning('Humanize fallback used', [
                'reason' => $reason,
                'original_length' => strlen($text),
                'groq_result_length' => $result ? strlen($result) : 0,
            ]);
            $result = $this->enhancedHumanize($text, $style);
        }

        return $result;
    }

    /**
     * Word-overlap similarity check.
     * Returns true if >60% of unique words are shared between the two texts.
     */
    private function tooSimilar(string $a, string $b, float $threshold = 0.6): bool
    {
        $wa = array_unique(str_word_count(strtolower($a), 1));
        $wb = array_unique(str_word_count(strtolower($b), 1));

        if (!$wa || !$wb) return true;

        $overlap = count(array_intersect($wa, $wb)) / max(count($wa), count($wb));
        return $overlap > $threshold;
    }

    private function enhancedHumanize($text, $style = 'casual')
    {
        // Dictionary of formal/AI words to casual/human equivalents
        $replacements = [
            'cannot' => "can't",
            'do not' => "don't",
            'does not' => "doesn't",
            'is not' => "isn't",
            'are not' => "aren't",
            'will not' => "won't",
            'it is' => "it's",
            'i am' => "I'm",
            'you are' => "you're",
            'they are' => "they're",
            'we are' => "we're",
            'that is' => "that's",
            'there is' => "there's",
            'would not' => "wouldn't",
            'could not' => "couldn't",
            'should not' => "shouldn't",
            'very' => 'really',
            'many' => 'a lot of',
            'numerous' => 'lots of',
            'furthermore' => 'also',
            'moreover' => 'and',
            'therefore' => 'so',
            'however' => 'but',
            'in conclusion' => 'to wrap up',
            'it is important to note' => 'worth noting',
            'additionally' => 'on top of that',
            'simply takes' => 'just needs',
            'requires' => 'needs',
            'intentional habits' => 'good habits',
            'uncover' => 'find',
            'hidden leaks' => 'secret drains',
            'impulsive' => 'on-a-whim',
            'gratification' => 'satisfaction',
            'undergoing' => 'going through',
            'fundamental shift' => 'huge change',
            'workflows' => 'processes',
            'entirely' => 'completely',
            'multi-agent' => 'multi-bot',
            'diagnose' => 'find',
            'bottlenecks' => 'issues',
            'deploy' => 'roll out',
            'optimize' => 'improve',
            'intervention' => 'help',
            'operations' => 'tasks',
            'driven by' => 'powered by',
            'automation' => 'auto-tech',
            'industrial' => 'factory',
            'real-time' => 'live',
            'ecosystem' => 'environment',
            'strategies' => 'plans',
            'implement' => 'set up',
            'significant' => 'big',
            'various' => 'different',
            'utilize' => 'use',
            'facilitate' => 'help',
            'demonstrate' => 'show',
            'approximately' => 'about',
            'subsequently' => 'then',
        ];

        // 1. Swap the words
        $text = str_ireplace(array_keys($replacements), array_values($replacements), $text);

        // 2. Break up very long sentences
        $sentences = preg_split('/(?<=[.!?])\s+/', $text);
        $rewritten = [];
        foreach ($sentences as $s) {
            if (trim($s) === '') continue;
            if (strlen($s) > 100) {
                $parts = preg_split('/,\s*/', $s);
                if (count($parts) > 1) {
                    $rewritten[] = rtrim($parts[0], '.') . '.';
                    $rewritten[] = ucfirst(trim(implode(', ', array_slice($parts, 1))));
                    continue;
                }
            }
            $rewritten[] = $s;
        }
        $text = implode(' ', $rewritten);

        // 3. Force a casual opener (remove existing one first to guarantee a change)
        $openers = ['Honestly, ', 'You know, ', 'To be honest, ', 'I think ', 'Basically, '];
        $opener = $openers[array_rand($openers)];
        
        // Remove existing AI opener
        $text = preg_replace('/^(honestly|you know|to be honest|i think|basically)[,\s]+/i', '', $text);
        
        // Add the new human opener
        $text = $opener . lcfirst($text);

        return $text;
    }
}