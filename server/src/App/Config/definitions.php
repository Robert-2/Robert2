<?php
declare(strict_types=1);

use Psr\Cache\CacheItemPoolInterface;
use Psr\Container\ContainerInterface;
use Loxya\Console\Command;
use Loxya\Services;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\TagAwareAdapter;
use Symfony\Contracts\Cache\CacheInterface;

return [
    'logger' => function (ContainerInterface $container) {
        $settings = $container->get('settings')['logger'] ?? [];
        return new Services\Logger($settings);
    },

    'auth' => function () {
        return new Services\Auth([
            new Services\Auth\JWT,
        ]);
    },

    'cache' => function (): TagAwareAdapter {
        return new TagAwareAdapter(
            new FilesystemAdapter('core', 0, CACHE_FOLDER)
        );
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
    'httpCache' => DI\get(\Slim\HttpCache\CacheProvider::class),

    Services\Auth::class => DI\get('auth'),
    Services\Logger::class => DI\get('logger'),
    CacheInterface::class => DI\get('cache'),
    CacheItemPoolInterface::class => DI\get('cache'),
];
