<?php
declare(strict_types=1);

namespace Robert2\API;

use DI\ContainerBuilder;
use Illuminate\Database\Capsule\Manager as Database;
use Illuminate\Events\Dispatcher as EventDispatcher;
use Psr\Container\ContainerInterface;
use Robert2\API\Config\Config;
use Robert2\API\Models;
use Robert2\API\Observers\EventMaterialObserver;
use Robert2\API\Observers\EventObserver;
use Robert2\API\Observers\MaterialObserver;

final class Kernel
{
    private static $instance;

    protected $container;

    public static function boot()
    {
        if (!is_null(static::$instance) && Config::getEnv() !== 'test') {
            return static::$instance;
        }
        return static::$instance = new static;
    }

    public static function get()
    {
        if (is_null(static::$instance)) {
            throw new \LogicException("Tentative de récupération du kernel avant le boot de celui-ci.");
        }
        return static::$instance;
    }

    public static function reset()
    {
        static::$instance = new static;
    }

    // ------------------------------------------------------
    // -
    // -    Instance methods
    // -
    // ------------------------------------------------------

    private function __construct()
    {
        $this->initializeContainer();
        $this->initializeDatabase();
    }

    public function getContainer(): ContainerInterface
    {
        if (!$this->container) {
            throw new \LogicException("Impossible de récupérer le conteneur à partir d'un kernel non booté.");
        }
        return $this->container;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function initializeContainer(): ContainerInterface
    {
        $builder = new ContainerBuilder();

        $builder->addDefinitions(CONFIG_FOLDER . DS . 'definitions.php');

        $container = $builder->build();

        //
        // - Settings
        //

        $container->set('settings', Config::getSettings());

        return $this->container = $container;
    }

    protected function initializeDatabase()
    {
        $database = new Database();

        $database->addConnection(Config::getDbConfig());
        $database->setEventDispatcher(new EventDispatcher());
        $database->bootEloquent();

        $this->container->set('database', $database);

        // - Observers
        Models\Event::observe(EventObserver::class);
        Models\Material::observe(MaterialObserver::class);
        Models\EventMaterial::observe(EventMaterialObserver::class);
    }
}
