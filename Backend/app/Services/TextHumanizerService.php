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
        // Try OpenAI first
        $result = $this->openAIService->humanizeText($text, $style);
        
        // Fallback to basic humanization if OpenAI fails
        if (!$result) {
            Log::info('Using basic humanization fallback');
            $result = $this->basicHumanize($text);
        }

        return $result;
    }

    private function basicHumanize($text)
    {
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
        ];

        $text = str_ireplace(array_keys($replacements), array_values($replacements), $text);
        
        // Add some variation
        $sentences = explode('.', $text);
        if (count($sentences) > 2) {
            $variations = ['Actually,', 'Honestly,', 'To be honest,', 'I think', 'In my opinion,'];
            $index = array_rand($variations);
            $sentences[1] = $variations[$index] . ' ' . $sentences[1];
            $text = implode('.', $sentences);
        }

        return $text;
    }
}