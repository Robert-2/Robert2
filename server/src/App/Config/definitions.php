<?php
declare(strict_types=1);

use function DI\get;
use Psr\Container\ContainerInterface;
use Robert2\API\Services;

return [
    'logger' => function (ContainerInterface $container) {
        $settings = $container->get('settings')['logger'] ?? [];
        return new Services\Logger($settings);
    },

    'auth' => function () {
        return new Services\Auth([
            new Services\Auth\JWT,
            new Services\Auth\CAS,
        ]);
    },

    //
    // - Aliases
    //

    'cache' => get(\Slim\HttpCache\CacheProvider::class),
    'i18n' => get(Services\I18n::class),
    'view' => get(Services\View::class),

    Services\Auth::class => get('auth'),
    Services\Logger::class => get('logger'),
];
