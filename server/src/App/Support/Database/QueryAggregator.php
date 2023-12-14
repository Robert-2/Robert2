<?php
declare(strict_types=1);

namespace Loxya\Support\Database;

use Illuminate\Database\Query\Builder as CoreBuilder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Expression;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final class QueryAggregator
{
    /** @var Collection<array-key, Relation|Builder|CoreBuilder> */
    protected Collection $queries;

    protected array $orders = [];

    /**
     * Constructeur.
     *
     * @param array<Relation|Builder|CoreBuilder> $queries Les requêtes à ajouter à l'agrégat.
     */
    public function __construct(array $queries = [])
    {
        $this->queries = new Collection();

        foreach ($queries as $modelClass => $query) {
            $this->add($modelClass, $query);
        }
    }

    /**
     * Permet d'ajouter une requête à l'agrégat.
     *
     * @param Relation|Builder|CoreBuilder $query La requête  à ajouter à l'agrégat.
     */
    public function add(string $modelClass, Relation|Builder|CoreBuilder $query): static
    {
        if (!class_exists($modelClass) || !is_subclass_of($modelClass, Model::class)) {
            throw new \InvalidArgumentException(sprintf('Unknown model class `%s`.', $modelClass));
        }

        $this->queries->put($modelClass, $query);

        return $this;
    }

    /**
     * Les éléments de l'agrégat, sous forme de collection.
     *
     * @return Collection
     */
    public function get(): Collection
    {
        $collection = new Collection();

        foreach ($this->queries as $query) {
            $collection = $collection->concat($query->get());
        }

        if (!empty($this->orders)) {
            $collection = $collection
                ->sortBy($this->orders)
                ->values();
        }

        return $collection;
    }

    /**
     * Ajoute un `order by` à l'agrégat.
     *
     * Attention, la/les colonne(s) doivent être présentes dans chaque éléments de l'agrégat.
     *
     * @throws \InvalidArgumentException
     */
    public function orderBy(string $column, $direction = 'asc'): static
    {
        $direction = strtolower($direction);

        if (!in_array($direction, ['asc', 'desc'], true)) {
            throw new \InvalidArgumentException('Order direction must be "asc" or "desc".');
        }

        $this->orders[] = [$column, $direction];

        return $this;
    }

    /**
     * Ajout d'un `order by` descendant à l'agrégat.
     */
    public function orderByDesc(string $column): static
    {
        return $this->orderBy($column, 'desc');
    }

    /**
     * Les éléments résultant de l'agrégat, paginés.
     */
    public function paginate($perPage = null, string $pageName = 'page', $page = null): LengthAwarePaginator
    {
        $unionQueries = $this->queries
            ->map(function (Relation|Builder|CoreBuilder $query, string $modelClass) {
                $alias = (new $modelClass)->getTable();

                /** @var CoreBuilder $unionQuery */
                $unionQuery = $query
                    ->clone()
                    ->when(
                        !($query instanceof CoreBuilder),
                        fn ($builder) => $builder->toBase(),
                    )
                    ->select([
                        new Expression(sprintf("'%s' as `entity`", md5($modelClass))),
                        sprintf('%s.id', $alias),
                    ]);

                foreach ($this->orders as $order) {
                    $unionQuery->addSelect(sprintf('%s.%s', $alias, $order[0]));
                }

                return $unionQuery;
            })
            ->values()
            ->reduce(fn (CoreBuilder|null $unionQueries, CoreBuilder $query) => (
                $unionQueries !== null ? $unionQueries->unionAll($query) : $query
            ));

        foreach ($this->orders as $order) {
            $unionQueries = $unionQueries->orderBy($order[0], $order[1]);
        }

        $unionQueries = $unionQueries
            ->orderBy('id', 'asc')
            ->orderBy('entity', 'asc');

        /** @var LengthAwarePaginator $pagination */
        $pagination = $unionQueries->paginate($perPage, ['id', 'entity'], $pageName, $page);

        $entities = $pagination->getCollection()->reduce(
            function ($entities, $result, $index) {
                $result = (array) $result;

                $entities[$result['entity']] ??= [];
                $entities[$result['entity']][$result['id']] = $index;
                return $entities;
            },
            []
        );

        $data = $this->queries
            ->reduce(
                function (
                    Collection $collection,
                    Relation|Builder|CoreBuilder $query,
                    string $modelClass,
                ) use ($entities) {
                    $identifier = md5($modelClass);
                    if (empty($entities[$identifier])) {
                        return $collection;
                    }

                    $ids = array_keys($entities[$identifier]);
                    $alias = (new $modelClass)->getTable();

                    $results = $query
                        ->cloneWithout(['orders', 'limit', 'offset'])
                        ->cloneWithoutBindings(['order'])
                        ->whereIn(sprintf('%s.id', $alias), $ids)
                        ->get();

                    return $collection->concat(
                        $results->map(fn ($item) => [
                            'position' => $entities[$identifier][$item->id],
                            'data' => $item,
                        ])
                    );
                },
                new Collection(),
            )
            ->sortBy(fn ($result) => $result['position'])
            ->map(fn ($result) => $result['data'])
            ->values();

        return new LengthAwarePaginator(
            $data,
            $pagination->total(),
            $pagination->perPage(),
            $pagination->currentPage(),
            $pagination->getOptions(),
        );
    }
}
