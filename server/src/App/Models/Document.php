<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;

class Document extends BaseModel
{
    private const FILE_BASEPATH = (
        DATA_FOLDER . DS . 'materials' . DS . 'documents'
    );

    public $table = 'documents';

    protected $orderField = 'name';
    protected $orderDirection = 'asc';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'material_id' => V::notEmpty()->numeric(),
            'name' => V::callback([$this, 'checkName']),
            'type' => V::notEmpty()->length(2, 191),
            'size' => V::notEmpty()->numeric(),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkName($value)
    {
        V::notEmpty()
            ->length(2, 191)
            ->check($value);

        if (empty($this->material_id)) {
            return true;
        }

        $query = static::newQuery()
            ->where('name', $value)
            ->where('material_id', $this->material_id);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->exists()) {
            return 'document-already-in-use-for-this-material';
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function Material()
    {
        return $this->belongsTo(Material::class)
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
        return static::getFilePath($this->material_id, $this->name);
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

    public function remove($id, array $options = []): ?BaseModel
    {
        $document = static::findOrFail($id);
        if (!$document->forceDelete()) {
            throw new \RuntimeException(
                sprintf("Unable to delete document %d.", $id)
            );
        }

        $filePath = $document->file_path;
        if (!unlink($filePath)) {
            throw new \RuntimeException(
                sprintf("Unable to delete file '%s' from data folder: %s", $document->name, $filePath)
            );
        };

        return $document;
    }

    public static function getFilePath(int $materialId, ?string $name = null): string
    {
        $path = static::FILE_BASEPATH . DS . $materialId;
        if ($name) {
            $path .= DS . $name;
        }
        return $path;
    }
}
