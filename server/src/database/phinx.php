<?php

require_once __DIR__ . '/../App/Config/Config.php';
require_once __DIR__ . '/../App/Config/constants.php';
require_once __DIR__ . '/../App/Config/functions.php';

$config = Robert2\API\Config\Config::getSettings('db');
$pdo = Robert2\API\Config\Config::getPDO();

return [
    'paths' => [
        'migrations' => __DIR__ . '/migrations',
        'seeds'      => __DIR__ . '/seeds',
    ],
    'environments' => [
        'default_database' => 'development',
        'development'      => [
            'table_prefix' => $config['prefix'],
            'name'         => $config['database'],
            'connection'   => $pdo,
            'charset'      => 'utf8mb4',
            'collation'    => 'utf8mb4_unicode_ci',
        ],
        'test' => [
            'table_prefix' => $config['prefix'],
            'name'         => $config['testDatabase'],
            'connection'   => $pdo,
            'charset'      => 'utf8mb4',
            'collation'    => 'utf8mb4_unicode_ci',
        ],
    ],
];
