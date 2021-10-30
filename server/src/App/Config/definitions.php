<?php
declare(strict_types=1);

use Psr\Cache\CacheItemPoolInterface;
use Psr\Container\ContainerInterface;
use Robert2\API\Console\Command;
use Robert2\API\Services;
use Symfony\Component\Cache\Adapter\AbstractAdapter;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\CacheInterface;

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

    'cache' => function (): AbstractAdapter {
        return new FilesystemAdapter('core', 0, CACHE_FOLDER);
    },

    'console.commands' => DI\add([
        DI\get(Command\Migrations\MigrateCommand::class),
        DI\get(Command\Migrations\StatusCommand::class),
        DI\get(Command\Migrations\RollbackCommand::class),
        DI\get(Command\Migrations\CreateCommand::class),
    ]),

    //
    // - Aliases
    //

    'i18n' => DI\get(Services\I18n::class),
    'view' => DI\get(Services\View::class),
    'license' => DI\get(Services\License::class),
    'httpCache' => DI\get(\Slim\HttpCache\CacheProvider::class),

    Services\Auth::class => DI\get('auth'),
    Services\Logger::class => DI\get('logger'),
    CacheInterface::class => DI\get('cache'),
    CacheItemPoolInterface::class => DI\get('cache'),
];
