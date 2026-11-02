<?php

return [
    // Used by HeuristicDetectionService to penalize AI-sounding text,
    // AND by OpenAIService::humanizeText() to tell the model what to avoid.
    // Keeping this in one place means detection and humanization always
    // agree on what "sounds AI" — no drift between the two.
    'phrases' => [
        'in conclusion' => 0.12,
        'furthermore' => 0.1,
        'moreover' => 0.1,
        'therefore' => 0.12,
        'it is important to note' => 0.12,
        'as previously mentioned' => 0.12,
        'it should be noted' => 0.12,
        'in addition' => 0.1,
        'consequently' => 0.12,
        'additionally' => 0.12,
        'it is essential' => 0.14,
        'one major concern' => 0.14,
        'in summary' => 0.12,
        'it is crucial' => 0.12,
        'this leads to' => 0.1,
        'there are several' => 0.1,
        'overall' => 0.08,
        'significantly' => 0.08,
    ],
];