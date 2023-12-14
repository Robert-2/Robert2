<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Loxya\Console\Command;
use Loxya\Services;
use Odan\Session\FlashInterface;
use Odan\Session\MemorySession;
use Odan\Session\PhpSession;
use Odan\Session\SessionInterface;
use Odan\Session\SessionManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Container\ContainerInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\TagAwareAdapter;
use Symfony\Contracts\Cache\CacheInterface;

return [
    'logger' => function () {
        $settings = Config::get('logger', []);
        return new Services\Logger($settings);
    },

    'auth' => function (ContainerInterface $container) {
        $authenticators = $container->get('auth.authenticators');
        return new Services\Auth($authenticators);
    },

    'session' => function () {
        $secure = Config::getBaseUri()->getScheme() === 'https';
        $sessionClass = Config::getEnv() !== 'test'
            ? PhpSession::class
            : MemorySession::class;

        return new $sessionClass([
            'name' => 'LOXYA_SESSION',
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'secure' => $secure,
            'cache_limiter' => 'nocache',
        ]);
    },

    'auth.authenticators' => DI\add([
        DI\get(Services\Auth\JWT::class),
    ]),

    'cache' => function (): TagAwareAdapter {
        return new TagAwareAdapter(
            new FilesystemAdapter('core', 0, CACHE_FOLDER)
        );
    },

    'flash' => function (ContainerInterface $container) {
        return $container->get(SessionInterface::class)->getFlash();
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
    SessionManagerInterface::class => DI\get('session'),
    SessionInterface::class => DI\get('session'),
    FlashInterface::class => DI\get('flash'),
];
