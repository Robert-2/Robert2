<?php
declare(strict_types=1);

namespace Robert2\API;

use DI\ContainerBuilder;
use Illuminate\Database\Capsule\Manager as Database;
use Illuminate\Events\Dispatcher as EventDispatcher;
use Psr\Container\ContainerInterface;
use Robert2\API\Config\Config;

class Kernel
{
    protected $container;

    protected $booted = false;

    public function boot(): self
    {
        if ($this->booted) {
            return $this;
        }

        $this->initializeContainer();
        $this->initializeDatabase();

        $this->booted = true;

        return $this;
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
    }
}
