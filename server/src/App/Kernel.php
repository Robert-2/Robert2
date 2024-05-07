<?php
declare(strict_types=1);

namespace Loxya;

use DI\Container;
use DI\ContainerBuilder;
use Illuminate\Container\Container as IlluminateContainer;
use Illuminate\Database\Capsule\Manager as Database;
use Illuminate\Database\DatabaseTransactionsManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Events\Dispatcher as EventDispatcher;
use Loxya\Config\Config;
use Loxya\Support\Paginator\CursorPaginator;
use Loxya\Support\Paginator\LengthAwarePaginator;
use Loxya\Support\Paginator\Paginator;
use Respect\Validation\Factory as ValidatorFactory;

final class Kernel
{
    private static $instance;

    protected Container $container;

    public static function boot(): static
    {
        if (!is_null(static::$instance)) {
            return static::$instance;
        }
        return static::$instance = new static();
    }

    public static function get(): static
    {
        if (is_null(static::$instance)) {
            throw new \LogicException("Attempt to retrieve the kernel before it boots.");
        }
        return static::$instance;
    }

    public static function reset(): void
    {
        IlluminateContainer::getInstance()->flush();

        static::$instance = new static();
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

    public function getContainer(): Container
    {
        if (!$this->container) {
            throw new \LogicException("Unable to retrieve the container from an uninitialized kernel.");
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
        $this->container = (new ContainerBuilder())
            ->addDefinitions(CONFIG_FOLDER . DS . 'definitions.php')
            ->build();
    }

    protected function initializeValidator(): void
    {
        ValidatorFactory::setDefaultInstance(
            (new ValidatorFactory())
                ->withTranslator(fn ($value) => (
                    $this->container->get('i18n')->translate($value)
                )),
        );
    }

    protected function initializeDatabase(): void
    {
        // - Illuminate container.
        $illuminateContainer = IlluminateContainer::getInstance();
        $illuminateContainer->singleton('db.transactions', static fn () => (
            new DatabaseTransactionsManager()
        ));
        $illuminateContainer->bind(
            \Illuminate\Pagination\LengthAwarePaginator::class,
            LengthAwarePaginator::class,
        );
        $illuminateContainer->bind(
            \Illuminate\Pagination\CursorPaginator::class,
            CursorPaginator::class,
        );
        $illuminateContainer->bind(
            \Illuminate\Pagination\Paginator::class,
            Paginator::class,
        );

        // - Database.
        $database = new Database($illuminateContainer);
        $database->addConnection(Config::getDbConfig());
        $database->setEventDispatcher(
            (new EventDispatcher($illuminateContainer))
                ->setTransactionManagerResolver(static fn () => (
                    $illuminateContainer->bound('db.transactions')
                        ? $illuminateContainer->make('db.transactions')
                        : null
                )),
        );
        $database->bootEloquent();

        $this->container->set('database', $database);

        // - Configuration du fonctionnement des modèles.
        // TODO: Model::preventSilentlyDiscardingAttributes();
        Model::preventAccessingMissingAttributes();

        // - Morphs
        Relation::enforceMorphMap([
            Models\Event::TYPE => Models\Event::class,
            Models\Material::TYPE => Models\Material::class,
            Models\Technician::TYPE => Models\Technician::class,
        ]);

        // - Observers
        Models\Event::observe(Observers\EventObserver::class);
        Models\EventMaterial::observe(Observers\EventMaterialObserver::class);
        Models\Material::observe(Observers\MaterialObserver::class);
        Models\AttributeCategory::observe(Observers\AttributeCategoryObserver::class);
        Models\Beneficiary::observe(Observers\BeneficiaryObserver::class);
        Models\Park::observe(Observers\ParkObserver::class);
        Models\Technician::observe(Observers\TechnicianObserver::class);
        Models\User::observe(Observers\UserObserver::class);
    }
}
