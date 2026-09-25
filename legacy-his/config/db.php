<?php
// Read settings from environment variables, with dev-only defaults for your laptop
return [
    'class' => 'yii\db\Connection',
    'dsn' => getenv('HIS_DB_DSN') ?: 'mysql:host=127.0.0.1;port=3306;dbname=his',
    'username' => getenv('HIS_DB_USER') ?: 'his',
    'password' => getenv('HIS_DB_PASSWORD') ?: 'his_dev_password',
    'charset' => 'utf8mb4',
];