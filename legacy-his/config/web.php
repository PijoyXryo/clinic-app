<?php
return [
    'id' => 'legacy-his',
    'basePath' => dirname(__DIR__),
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm' => '@vendor/npm-asset',
    ],
    'components' => [
        'db' => require __DIR__ . '/db.php',

        'request' => [
            'enableCookieValidation' => false,
            // Understand JSON request bodies
            'parsers' => ['application/json' => 'yii\web\JsonParser'],
        ],

        // Always answer in JSON (this is an API, not a website)
        'response' => ['format' => yii\web\Response::FORMAT_JSON],

        // Clean URLs: /patients instead of /index.php?r=patient/index
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => true, // unknown URLs → 404
            'rules' => [
                'GET patients' => 'patient/index',
                'GET patients/by-ic/<noKp>' => 'patient/by-ic',
                'GET patients/<id:\d+>' => 'patient/view',
                'POST patients' => 'patient/create',
            ],
        ],
    ],
    'params' => [
        'apiKey' => getenv('HIS_API_KEY') ?: 'dev-key',
    ],
];