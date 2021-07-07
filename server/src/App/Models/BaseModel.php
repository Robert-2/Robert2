<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Respect\Validation\Exceptions\NestedValidationException;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;

abstract class BaseModel extends Model
{
    private $columns;

    protected $orderField;
    protected $orderDirection;

    protected $allowedSearchFields = [];
    protected $searchField;
    protected $searchTerm;

    protected $fillable;

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public $validation;

    const EXTRA_CHARS = "-_.' ÇçàÀâÂäÄåÅèÈéÉêÊëËíÍìÌîÎïÏòÒóÓôÔöÖðÐõÕøØúÚùÙûÛüÜýÝÿŸŷŶøØæÆœŒñÑßÞ";

    public function __construct(array $attributes = [])
    {
        Config::getCapsule();

        parent::__construct($attributes);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $withDeleted = false): Builder
    {
        $builder = $this->_getOrderBy();

        if (!empty($this->searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    public function getAllFiltered(array $conditions, bool $withDeleted = false): Builder
    {
        $builder = static::where($conditions);

        if (!empty($this->searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $this->_getOrderBy($builder);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function setOrderBy(?string $orderBy = null, bool $ascending = true): BaseModel
    {
        if ($orderBy) {
            $this->orderField = $orderBy;
        }
        $this->orderDirection = $ascending ? 'asc' : 'desc';
        return $this;
    }

    public function setSearch(?string $term = null, $fields = null): BaseModel
    {
        if (empty($term)) {
            return $this;
        }

        if ($fields) {
            $fields = !is_array($fields) ? explode('|', $fields) : $fields;
            foreach ($fields as $field) {
                if (!in_array($field, $this->getAllowedSearchFields())) {
                    throw new \InvalidArgumentException("Search field « $field » not allowed.");
                }
                $this->searchField = $field;
            }
        }

        $this->searchTerm = trim($term);
        return $this;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    "Repository" methods
    // —
    // ——————————————————————————————————————————————————————

    public static function new(array $data = []): BaseModel
    {
        // TODO: Migrer les éventuels overwrites de la méthode legacy dans les modèles.
        //       puis déplacer l'implémentation depuis la methode legacy vers cette méthode.
        return static::staticEdit(null, $data);
    }

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        // TODO: Migrer les éventuels overwrites de la méthode legacy dans les modèles.
        //       puis déplacer l'implémentation depuis la methode legacy vers cette méthode.
        return (new static)->edit($id, $data);
    }

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        // TODO: Migrer les éventuels overwrites de la méthode legacy dans les modèles.
        //       puis déplacer l'implémentation depuis la methode legacy vers cette méthode.
        return (new static)->remove($id, $options);
    }

    public static function staticUnremove($id): BaseModel
    {
        // TODO: Migrer les éventuels overwrites de la méthode legacy dans les modèles.
        //       puis déplacer l'implémentation depuis la methode legacy vers cette méthode.
        return (new static)->unremove($id);
    }

    /** @deprecated Veuillez utiliser `new` ou `staticEdit`. */
    public function edit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class($this), $id);
        }

        $data = cleanEmptyFields($data);
        $data = $this->_trimStringFields($data);

        try {
            $model = static::firstOrNew(compact('id'));
            $model->fill($data)->validate()->save();
        } catch (QueryException $e) {
            throw (new ValidationException)
                ->setPDOValidationException($e);
        }

        return $model->refresh();
    }

    /** @deprecated Veuillez utiliser `staticRemove`. */
    public function remove($id, array $options = []): ?BaseModel
    {
        $options = array_merge(['force' => false], $options);

        $entity = static::withTrashed()->findOrFail($id);
        if ($entity->trashed() || $options['force'] === true) {
            if (!$entity->forceDelete()) {
                throw new \RuntimeException(sprintf("Unable to destroy the record %d.", $id));
            }
            return null;
        }

        if (!$entity->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the record %d.", $id));
        }

        return $entity;
    }

    /** @deprecated Veuillez utiliser `staticUnremove`. */
    public function unremove($id): BaseModel
    {
        $entity = static::onlyTrashed()->findOrFail($id);
        if (!$entity->restore()) {
            throw new \RuntimeException(sprintf("Unable to restore the record %d.", $id));
        }
        return $entity;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Other useful methods
    // —
    // ——————————————————————————————————————————————————————

    public static function staticExists($id): bool
    {
        // TODO: Migrer les éventuels overwrites de la méthode legacy dans les modèles.
        //       puis déplacer l'implémentation depuis la methode legacy vers cette méthode.
        return (new static)->exists($id);
    }

    /** @deprecated Veuillez utiliser `staticExists`. */
    public function exists($id): bool
    {
        return static::where('id', $id)->exists();
    }

    public function validate(): self
    {
        $rules = $this->validation;
        if (empty($rules)) {
            throw new \RuntimeException("Validation rules cannot be empty.");
        }

        // - Récupère les attributs du modèle, castés (sauf les données tout juste ajoutées).
        $data = $this->addCastAttributesToArray(
            $this->getAttributes(),
            array_keys($this->getDirty())
        );

        foreach ($data as $field => $value) {
            if (is_array($value)) {
                unset($data[$field]);
            }
        }

        // - Validation
        $errors = [];
        foreach ($rules as $field => $rule) {
            try {
                $rule->setName($field)->assert($data[$field] ?? null);
            } catch (NestedValidationException $e) {
                $errors[$field] = $e->getMessages();
            }
        }

        if (count($errors) > 0) {
            throw (new ValidationException)
                ->setValidationErrors($errors);
        }

        return $this;
    }

    public function getTableColumns(): array
    {
        if (!$this->columns) {
            $this->columns = $this->getConnection()
                ->getSchemaBuilder()
                ->getColumnListing($this->getTable());
        }
        return $this->columns;
    }

    public function getAllowedSearchFields(): array
    {
        return array_unique(array_merge(
            (array)$this->searchField,
            (array)$this->allowedSearchFields
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _getOrderBy(?Builder $builder = null): Builder
    {
        $direction = $this->orderDirection ?: 'asc';

        $order = $this->orderField;
        if (!$order) {
            $order = in_array('name', $this->getTableColumns()) ? 'name' : 'id';
        }

        if ($builder) {
            return $builder->orderBy($order, $direction);
        }

        return static::orderBy($order, $direction);
    }

    protected function _setSearchConditions(Builder $builder): Builder
    {
        if (!$this->searchField || !$this->searchTerm) {
            return $builder;
        }

        $term = sprintf('%%%s%%', addcslashes($this->searchTerm, '%_'));

        if (is_array($this->searchField)) {
            $group = function (Builder $query) use ($term) {
                foreach ($this->searchField as $field) {
                    $query->orWhere($field, 'LIKE', $term);
                }
            };
            return $builder->where($group);
        }

        return $builder->where($this->searchField, 'LIKE', $term);
    }

    protected function _trimStringFields(array $data): array
    {
        $trimmedData = [];
        foreach ($data as $field => $value) {
            $isString = array_key_exists($field, $this->casts) && $this->casts[$field] === 'string';
            $trimmedData[$field] = ($isString && $value) ? trim($value) : $value;
        }
        return $trimmedData;
    }

    // @see https://laravel.com/docs/8.x/eloquent-serialization#customizing-the-default-date-format
    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
