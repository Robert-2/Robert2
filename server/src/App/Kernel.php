<?php
declare(strict_types=1);

namespace Robert2\API;

use DI\ContainerBuilder;
use Illuminate\Container\Container as IlluminateContainer;
use Illuminate\Database\Capsule\Manager as Database;
use Illuminate\Database\DatabaseTransactionsManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Events\Dispatcher as EventDispatcher;
use Psr\Container\ContainerInterface;
use Respect\Validation\Factory as ValidatorFactory;
use Robert2\API\Config\Config;

final class Kernel
{
    private static $instance;

    protected $container;

    public static function boot()
    {
        if (!is_null(static::$instance)) {
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
        $this->initializeValidator();
        $this->initializeDatabase();
    }

    public function getContainer(): ContainerInterface
    {
        if (!$this->container) {
            throw new \LogicException("Impossible de récupérer le conteneur à partir d'un kernel non initialisé.");
        }
        return $this->container;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function initializeContainer(): void
    {
        $builder = new ContainerBuilder();

        $builder->addDefinitions(CONFIG_FOLDER . DS . 'definitions.php');

        $container = $builder->build();

        //
        // - Settings
        //

        $container->set('settings', Config::getSettings());
        $this->container = $container;
    }

    protected function initializeValidator(): void
    {
        ValidatorFactory::setDefaultInstance(
            (new ValidatorFactory())
                ->withTranslator(fn($value) => (
                    $this->container->get('i18n')->translate($value)
                ))
        );
    }

    protected function initializeDatabase(): void
    {
        // - Illuminate container.
        $illuminateContainer = new IlluminateContainer;
        $illuminateContainer->singleton('db.transactions', fn() => (
            new DatabaseTransactionsManager
        ));

        // - Database.
        $database = new Database($illuminateContainer);
        $database->addConnection(Config::getDbConfig());
        $database->setEventDispatcher(
            new EventDispatcher($illuminateContainer)
        );
        $database->bootEloquent();

        $this->container->set('database', $database);

        // - Configuration du fonctionnement des modèles.
        // TODO: Model::preventSilentlyDiscardingAttributes();
        Model::preventAccessingMissingAttributes();

        // - Morphs
        // TODO: `Relation::enforceMorphMap()` quand les tags seront migrés.
        Relation::morphMap([
            Models\Event::TYPE => Models\Event::class,
        ]);

        // - Observers
        Models\Event::observe(Observers\EventObserver::class);
        Models\EventMaterial::observe(Observers\EventMaterialObserver::class);
        Models\Material::observe(Observers\MaterialObserver::class);
        Models\Park::observe(Observers\ParkObserver::class);
    }
}
