<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Robert2\API\Models\BaseModel;

/**
 * WithModel.
 *
 * @method string|BaseModel getModelClass()
 */
trait WithModel
{
    /** @var string|BaseModel|null */
    protected static $modelClass = null;

    protected function getModel(): BaseModel
    {
        $modelClass = $this->getModelClass();
        return new $modelClass;
    }

    protected function getModelClass(): string
    {
        if (static::$modelClass !== null) {
            if (!is_subclass_of(static::$modelClass, BaseModel::class)) {
                throw new \LogicException("Missing or invalid `modelClass` static property in controller.");
            }
            return static::$modelClass;
        }

        // - Détection automatique du modèle.
        $controllerName = class_basename($this);
        $modelName = preg_replace('/Controller$/', '', $controllerName);
        $modelFullName = sprintf('\\Robert2\\API\\Models\\%s', $modelName);
        if (!class_exists($modelFullName, true) || !is_subclass_of($modelFullName, BaseModel::class)) {
            throw new \RuntimeException(
                sprintf("Unable to retrieves the associated model class for controller `%s`.", $controllerName)
            );
        }

        return static::$modelClass = $modelFullName;
    }
}
