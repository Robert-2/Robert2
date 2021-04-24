<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Robert2\API\Models\BaseModel;

/**
 * @property string|BaseModel $modelClass
 * @method string|BaseModel getModelClass()
 */
trait WithModel
{
    protected function getModel(): BaseModel
    {
        return new $this->getModelClass();
    }

    protected function getModelClass(): string
    {
        if (property_exists(static::class, 'modelClass')) {
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
