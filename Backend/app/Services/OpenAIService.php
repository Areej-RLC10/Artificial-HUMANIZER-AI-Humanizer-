<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $client;
    protected $apiKey;
    protected $models;

    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY');

        if (empty($this->apiKey)) {
            Log::error('GROQ_API_KEY is not set in .env');
        }

        // Both llama-3.1-8b-instant and llama-3.3-70b-versatile were
        // deprecated by Groq on 2026-06-17. Swapped for their recommended
        // replacements. See: https://console.groq.com/docs/deprecations
        $this->models = [
            'primary' => 'openai/gpt-oss-20b',
            'fallback' => 'gemma2-9b-it',
            'backup' => 'openai/gpt-oss-120b',
        ];

        $this->client = new Client([
            'base_uri' => 'https://api.groq.com/openai/v1/',
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function detectAIContent($text)
    {
        $attempts = [
            ['model' => $this->models['primary'], 'label' => 'primary'],
            ['model' => $this->models['fallback'], 'label' => 'fallback'],
            ['model' => $this->models['backup'], 'label' => 'backup'],
        ];

        foreach ($attempts as $attempt) {
            try {
                Log::info('📤 Sending detection request to Groq (model: ' . $attempt['model'] . ')');

                $response = $this->client->post('chat/completions', [
                    'json' => [
                        'model' => $attempt['model'],
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => "You are an expert AI text detector. Analyze the following text and return a JSON response with:\n1. 'score' (0-1) indicating AI likelihood\n2. 'confidence' (0-1) in your assessment\n3. 'indicators' array of key reasons for your decision\nImportant:\n- Do not assume formal or academic language is always human-written.\n- Many AI-generated texts are neutral, objective, and formal in tone.\n- Look for generic structure, repetitive phrasing, broad claims, and common AI transitions such as 'in conclusion', 'therefore', 'it is essential', 'additionally', and 'overall'.\n- If the text reads like a polished essay or policy statement, it may still be AI-generated.\nBe objective and specific."
                            ],
                            [
                                'role' => 'user',
                                'content' => $text,
                            ],
                        ],
                        'temperature' => 0.3,
                        'max_tokens' => 500,
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]);

                $data = json_decode($response->getBody(), true);
                Log::info('✅ Groq response received (model: ' . $attempt['model'] . ')');

                $result = json_decode($data['choices'][0]['message']['content'], true);

                return [
                    'score' => $result['score'] ?? 0.5,
                    'confidence' => $result['confidence'] ?? 0.5,
                    'indicators' => $result['indicators'] ?? [],
                    'method' => 'groq_' . $attempt['model'],
                ];
            } catch (RequestException $e) {
                $response = $e->getResponse();
                $statusCode = $response ? $response->getStatusCode() : 0;

                if ($statusCode === 429) {
                    Log::warning('⚠️ Rate limit hit on model: ' . $attempt['model'] . ', trying next model...');
                    if ($response && $response->hasHeader('retry-after')) {
                        $retryAfter = (int) $response->getHeader('retry-after')[0];
                        sleep(min($retryAfter, 5));
                    }
                    continue;
                }

                if ($statusCode === 400 && strpos($e->getMessage(), 'decommissioned') !== false) {
                    Log::warning('⚠️ Model decommissioned: ' . $attempt['model'] . ', trying next model...');
                    continue;
                }

                Log::error('❌ Groq Detection Failed (model: ' . $attempt['model'] . '): ' . $e->getMessage());
                break;
            } catch (\Exception $e) {
                Log::error('❌ Groq Detection Failed (model: ' . $attempt['model'] . '): ' . $e->getMessage());
                break;
            }
        }

        Log::error('❌ All Groq models failed, returning fallback');
        return [
            'score' => 0.5,
            'confidence' => 0.3,
            'indicators' => ['Detection temporarily unavailable'],
            'method' => 'fallback',
        ];
    }

    public function humanizeText($text, $style = 'casual')
    {
        $styleGuide = [
            'casual' => 'Use conversational language, contractions, and natural flow.',
            'professional' => 'Use formal language, clear structure, and professional tone.',
            'conversational' => 'Use friendly, engaging language with personal touches.',
        ];

        // Pull the same phrase list HeuristicDetectionService penalizes,
        // so the humanizer actively avoids exactly what your own detector
        // flags. Keeps detection and humanization in agreement.
        $avoidPhrases = implode(', ', array_keys(config('ai_patterns.phrases', [])));

        $attempts = [
            ['model' => $this->models['primary'], 'label' => 'primary'],
            ['model' => $this->models['fallback'], 'label' => 'fallback'],
            ['model' => $this->models['backup'], 'label' => 'backup'],
        ];

        foreach ($attempts as $attempt) {
            try {
                Log::info('📤 Sending humanization request to Groq (model: ' . $attempt['model'] . ')');

                $response = $this->client->post('chat/completions', [
                    'json' => [
                        'model' => $attempt['model'],
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => "You are an expert copywriter. Completely rewrite the provided text so it sounds like a real human wrote it.

MEANING GUARD (non-negotiable):
- Keep all facts, names, numbers, dates, and the original meaning unchanged.
- Do NOT invent details or remove information.

STYLE: {$styleGuide[$style]}

REWRITE RULES:
1. Change the sentence structure — combine some sentences, break others apart.
2. Replace formal words with simpler, conversational alternatives.
3. Vary sentence length dramatically (some short, some long).
4. Do NOT keep the same opening words as the original.
5. Do NOT add filler like 'Here is the rewritten text:' — return only the text.

FORBIDDEN PHRASES (they are strong AI tells): {$avoidPhrases}"
                            ],
                            [
                                'role' => 'user',
                                'content' => $text,
                            ],
                        ],
                        'temperature' => 0.9,
                        'max_tokens' => 2000,
                    ],
                ]);

                $data = json_decode($response->getBody(), true);
                Log::info('✅ Groq humanization response received (model: ' . $attempt['model'] . ')');

                return $data['choices'][0]['message']['content'];
            } catch (RequestException $e) {
                $response = $e->getResponse();
                $statusCode = $response ? $response->getStatusCode() : 0;

                if ($statusCode === 429) {
                    Log::warning('⚠️ Rate limit hit on model: ' . $attempt['model'] . ', trying next model...');
                    if ($response && $response->hasHeader('retry-after')) {
                        $retryAfter = (int) $response->getHeader('retry-after')[0];
                        sleep(min($retryAfter, 5));
                    }
                    continue;
                }

                if ($statusCode === 400 && strpos($e->getMessage(), 'decommissioned') !== false) {
                    Log::warning('⚠️ Model decommissioned: ' . $attempt['model'] . ', trying next model...');
                    continue;
                }

                Log::error('❌ Groq Humanization Failed (model: ' . $attempt['model'] . '): ' . $e->getMessage());
                break;
            } catch (\Exception $e) {
                Log::error('❌ Groq Humanization Failed (model: ' . $attempt['model'] . '): ' . $e->getMessage());
                break;
            }
        }

        Log::error('❌ All Groq models failed for humanization, returning null to trigger fallback');
        return null; 
    }
}