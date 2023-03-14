<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Monolog\Logger;
use Respect\Validation\Validator as V;

/**
 * Document d'un matériel.
 *
 * @property-read ?int $id
 * @property int $material_id
 * @property-read Material $material
 * @property string $name
 * @property string $type
 * @property int $size
 * @property-read string $file_path
 * @property-read Carbon $created_at
 * @property-read Carbon|null $updated_at
 * @property-read Carbon|null $deleted_at
 */
final class Document extends BaseModel
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
            'material_id' => V::notEmpty()->numericVal(),
            'name' => V::custom([$this, 'checkName']),
            'type' => V::notEmpty()->length(2, 191),
            'size' => V::notEmpty()->numericVal(),
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

    public function material()
    {
        return $this->belongsTo(Material::class);
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
    // -    Overwritten methods
    // -
    // ------------------------------------------------------

    public function delete()
    {
        if (!parent::delete()) {
            return false;
        }

        $filePath = $this->file_path;
        if (file_exists($filePath) && !unlink($filePath)) {
            container('logger')->log(
                Logger::WARNING,
                sprintf('Unable to delete file "%s" (path: %s)', $this->name, $filePath)
            );
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Utils Methods
    // -
    // ------------------------------------------------------

    public static function getFilePath(int $materialId, ?string $name = null): string
    {
        $path = static::FILE_BASEPATH . DS . $materialId;
        if ($name) {
            $path .= DS . $name;
        }
        return $path;
    }
}
