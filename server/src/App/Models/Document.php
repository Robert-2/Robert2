<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Model;
use Robert2\API\Errors;
use Robert2\API\Validation\Validator as V;

class Document extends BaseModel
{
    public $table = 'documents';

    protected $orderField = 'name';
    protected $orderDirection = 'asc';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'material_id' => V::notEmpty()->numeric(),
            'name' => V::notEmpty()->length(2, 191),
            'type' => V::notEmpty()->length(2, 191),
            'size' => V::notEmpty()->numeric(),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function Material()
    {
        return $this->belongsTo('Robert2\API\Models\Material')
            ->select(['id', 'name', 'reference']);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'material_id' => 'integer',
        'name' => 'string',
        'type' => 'string',
        'size' => 'integer',
    ];

    public function getMaterialAttribute()
    {
        $material = $this->Material()->first();
        return $material ? $material->toArray() : null;
    }


    public function getFilePathAttribute()
    {
        return self::getFilePath($this->material_id, $this->name);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'material_id',
        'name',
        'type',
        'size',
    ];

    // ------------------------------------------------------
    // -
    // -    Custom Methods
    // -
    // ------------------------------------------------------

    public function remove(int $id, array $options = []): ?Model
    {
        $model = self::find($id);
        if (empty($model)) {
            throw new Errors\NotFoundException;
        }

        $filePath = self::getFilePath((int)$model->material_id, $model->name);

        if (!$model->forceDelete()) {
            throw new \RuntimeException(
                sprintf("Unable to delete document %d.", $id)
            );
        }

        if (!unlink($filePath)) {
            throw new \RuntimeException(
                sprintf("Unable to delete file '%s' from data folder: %s", $model->name, $filePath)
            );
        };

        return $model;
    }

    public static function getFilePath(int $materialId, ?string $name = null): string
    {
        $path = DATA_FOLDER . DS . 'materials'. DS . $materialId;
        if ($name) {
            $path .= DS . $name;
        }
        return $path;
    }
}
