<?php
declare(strict_types=1);

namespace Robert2\API;

use DI\ContainerBuilder;
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
}
