<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Models\Traits\Taggable;
use Robert2\API\Validation\Validator as V;
use Psr\Http\Message\UploadedFileInterface;
use Ramsey\Uuid\Uuid;

class Material extends BaseModel
{
    use SoftDeletes;
    use Taggable;

    private const PICTURE_BASEPATH = (
        DATA_FOLDER . DS . 'materials'. DS . 'picture'
    );

    protected $searchField = ['name', 'reference'];

    protected $attributes = [
        'name' => null,
        'description' => null,
        'reference' => null,
        'is_unitary' => false,
        'park_id' => null,
        'category_id' => null,
        'sub_category_id' => null,
        'rental_price' => null,
        'stock_quantity' => null,
        'out_of_order_quantity' => null,
        'replacement_price' => null,
        'is_hidden_on_bill' => false,
        'is_discountable' => true,
        'picture' => null,
        'note' => null,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(2, 191),
            'reference' => V::callback([$this, 'checkReference']),
            'picture' => V::callback([$this, 'checkPicture']),
            'park_id' => V::callback([$this, 'checkParkId']),
            'category_id' => V::optional(V::numeric()),
            'sub_category_id' => V::optional(V::numeric()),
            'rental_price' => V::callback([$this, 'checkRentalPrice']),
            'stock_quantity' => V::callback([$this, 'checkStockQuantity']),
            'out_of_order_quantity' => V::callback([$this, 'checkOutOfOrderQuantity']),
            'replacement_price' => V::optional(V::floatVal()->max(999999.99, true)),
            'is_hidden_on_bill' => V::optional(V::boolType()),
            'is_discountable' => V::optional(V::boolType()),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkReference($value)
    {
        V::notEmpty()
            ->alnum('.,-+/_ ')
            ->length(2, 64)
            ->check($value);

        $query = static::where('reference', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'reference-already-in-use';
        }

        return true;
    }

    public function checkPicture($picture)
    {
        if (empty($picture)) {
            return true;
        }

        if (is_string($picture)) {
            V::length(5, 191)->check($picture);
            return true;
        }

        if (!($picture instanceof UploadedFileInterface)) {
            return false;
        }
        /** @var UploadedFileInterface $picture */

        if ($picture->getError() !== UPLOAD_ERR_OK) {
            return 'no-uploaded-files';
        }

        $settings = container('settings');
        if ($picture->getSize() > $settings['maxFileUploadSize']) {
            return 'file-exceeds-max-size';
        }

        $pictureType = $picture->getClientMediaType();
        if (!in_array($pictureType, $settings['authorizedImageTypes'])) {
            return 'file-type-not-allowed';
        }

        return true;
    }

    public function checkParkId($value)
    {
        return V::notEmpty()->numeric();
    }

    public function checkStockQuantity($value)
    {
        return V::intVal()->max(100000);
    }

    public function checkOutOfOrderQuantity($value)
    {
        return V::optional(V::intVal()->max(100000));
    }

    public function checkRentalPrice($value)
    {
        $billingMode = container('settings')['billingMode'];
        if ($billingMode === 'none') {
            return empty($value);
        }

        return V::floatVal()->max(999999.99, true);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'tags',
        'attributes',
    ];

    public function Park()
    {
        return $this->belongsTo(Park::class)
            ->select(['id', 'name']);
    }

    public function Category()
    {
        return $this->belongsTo(Category::class)
            ->select(['id', 'name']);
    }

    public function SubCategory()
    {
        return $this->belongsTo(SubCategory::class)
            ->select(['id', 'name', 'category_id']);
    }

    public function Attributes()
    {
        return $this->belongsToMany(Attribute::class, 'material_attributes')
            ->using(MaterialAttributesPivot::class)
            ->withPivot('value')
            ->select(['attributes.id', 'attributes.name', 'attributes.type', 'attributes.unit']);
    }

    public function Events()
    {
        $selectFields = [
            'events.id',
            'title',
            'start_date',
            'end_date',
            'location',
            'is_confirmed',
            'is_archived',
            'is_return_inventory_done',
        ];
        return $this->belongsToMany(Event::class, 'event_materials')
            ->using(EventMaterial::class)
            ->withPivot('id', 'quantity')
            ->select($selectFields)
            ->orderBy('start_date', 'desc');
    }

    public function Documents()
    {
        return $this->hasMany(Document::class)
            ->orderBy('name', 'asc')
            ->select(['id', 'name', 'type', 'size']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'reference' => 'string',
        'description' => 'string',
        'is_unitary' => 'boolean',
        'park_id' => 'integer',
        'category_id' => 'integer',
        'sub_category_id' => 'integer',
        'rental_price' => 'float',
        'stock_quantity' => 'integer',
        'out_of_order_quantity' => 'integer',
        'replacement_price' => 'float',
        'is_hidden_on_bill' => 'boolean',
        'is_discountable' => 'boolean',
        'note' => 'string',
    ];

    public function getStockQuantityAttribute($value)
    {
        return $this->castAttribute('stock_quantity', $value);
    }

    public function getOutOfOrderQuantityAttribute($value)
    {
        return $this->castAttribute('out_of_order_quantity', $value);
    }

    public function getParkAttribute()
    {
        $park = $this->Park()->first();
        return $park ? $park->toArray() : null;
    }

    public function getCategoryAttribute()
    {
        $category = $this->Category()->first();
        if (!$category) {
            return null;
        }
        $category = $category->toArray();
        unset($category['sub_categories']);

        return $category;
    }

    public function getSubCategoryAttribute()
    {
        $subCategory = $this->SubCategory()->first();
        return $subCategory ? $subCategory->toArray() : null;
    }

    public function getAttributesAttribute()
    {
        $attributes = $this->Attributes()->get();
        if (!$attributes) {
            return null;
        }
        return array_map(function ($attribute) {
            $type = $attribute['type'];
            $value = $attribute['pivot']['value'];
            if ($type === 'integer') {
                $value = (int)$value;
            }
            if ($type === 'float') {
                $value = (float)$value;
            }
            if ($type === 'boolean') {
                $value = $value === 'true' || $value === '1';
            }
            $attribute['value'] = $value;

            unset($attribute['pivot']);
            return $attribute;
        }, $attributes->toArray());
    }

    public function getEventsAttribute()
    {
        $events = $this->Events()->get();
        return $events ? $events->toArray() : null;
    }

    public function getPictureRealPathAttribute()
    {
        if (empty($this->picture)) {
            return null;
        }

        // - Dans le cas d'un fichier tout juste uploadé + avant le save.
        if ($this->picture instanceof UploadedFileInterface) {
            throw new \LogicException("Impossible de récuperer le chemin de l'image avant de l'avoir persisté.");
        }

        return static::PICTURE_BASEPATH . DS . $this->picture;
    }

    public function getDocumentsAttribute()
    {
        $documents = $this->Documents()->get();
        return $documents ? $documents->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'reference',
        'description',
        'park_id',
        'category_id',
        'sub_category_id',
        'rental_price',
        'stock_quantity',
        'out_of_order_quantity',
        'replacement_price',
        'is_hidden_on_bill',
        'is_discountable',
        'picture',
        'note',
    ];

    // ------------------------------------------------------
    // -
    // -    Overwrited methods
    // -
    // ------------------------------------------------------

    public function save(array $options = [])
    {
        $hasPictureChange = $this->isDirty('picture');
        if (!$hasPictureChange) {
            return parent::save($options);
        }

        // - On valide avant d'uploader...
        if ($options['validate'] ?? true) {
            $this->validate();
        }
        $options = array_replace($options, ['validate' => false]);

        $previousPicture = $this->getOriginal('picture');
        $newPicture = $this->getAttributeFromArray('picture');

        // - Si ce n'est ni un upload de fichier, ni une "suppression" de l'image existante.
        //   On vérifie que la chaîne de caractère passée (car ça doit en être une) correspond
        //   bien à un fichier existant dans le dossier attendu, sinon on renvoi une erreur.
        $isFileUpload = $newPicture instanceof UploadedFileInterface;
        if (!empty($newPicture) && !$isFileUpload) {
            if (!is_string($newPicture)) {
                throw new \Exception(
                    "Une erreur est survenue lors de l'upload de l'image: " .
                    "Le format de l'image à uploader n'est pas pris en charge."
                );
            }

            if (!@file_exists(static::PICTURE_BASEPATH . DS . $newPicture)) {
                throw new \Exception(
                    "Une erreur est survenue lors de l'upload de l'image: " .
                    "La chaîne passée de correspond pas à un fichier existant dans le dossier de destination."
                );
            }
        }

        // - Si on a un nouvel upload d'image, on la déplace dans le bon dossier.
        if ($isFileUpload) {
            /** @var UploadedFileInterface $newPicture */
            $extension = pathinfo($newPicture->getClientFilename(), PATHINFO_EXTENSION);
            $filename = sprintf('%s.%s', Uuid::uuid4()->toString(), $extension);

            if (!is_dir(static::PICTURE_BASEPATH)) {
                mkdir(static::PICTURE_BASEPATH, 0777, true);
            }

            try {
                $newPicture->moveTo(static::PICTURE_BASEPATH . DS . $filename);
            } catch (\Throwable $e) {
                throw new \Exception(
                    "Une erreur est survenue lors de l'upload de l'image: " .
                    "L'image n'a pas pû être déplacée dans le dossier de destination."
                );
            }

            $this->picture = $filename;
        }

        $rollbackUpload = function () use ($isFileUpload, $newPicture) {
            if (!$isFileUpload) {
                return;
            }

            try {
                @unlink(static::PICTURE_BASEPATH . DS . $this->picture);
            } catch (\Throwable $e) {
                // NOTE: On ne fait rien si la suppression plante car de toute
                //       façon on est déjà dans un contexte d'erreur...
            }

            // - On remet l'`UploadedFile` en valeur de l'attribut `picture`.
            $this->picture = $newPicture;
        };

        try {
            $saved = parent::save($options);
        } catch (\Throwable $e) {
            $rollbackUpload();
            throw $e;
        }

        if (!$saved) {
            $rollbackUpload();
            return false;
        }

        // - On supprime l'ancienne image...
        if ($previousPicture !== null) {
            try {
                @unlink(static::PICTURE_BASEPATH . DS . $previousPicture);
            } catch (\Throwable $e) {
                // NOTE: On ne fait rien si la suppression plante, le fichier sera orphelin mais le
                //       plantage de sa suppression ne justifie pas qu'on unsave le matériel, etc.
            }
        }

        return true;
    }

    public function delete()
    {
        $deleted = parent::delete();

        if ($this->forceDeleting && $deleted && !empty($this->picture)) {
            try {
                @unlink(static::PICTURE_BASEPATH . DS . $this->picture);
            } catch (\Throwable $e) {
                // NOTE: On ne fait rien si la suppression plante, le fichier sera orphelin mais le
                //       plantage de sa suppression ne justifie pas qu'on undelete le matériel.
            }
        }

        return $deleted;
    }

    // ------------------------------------------------------
    // -
    // -    Custom Methods
    // -
    // ------------------------------------------------------

    public static function recalcQuantitiesForPeriod(
        array $data,
        ?string $start = null,
        ?string $end = null,
        ?int $exceptEventId = null,
        ?array $concurrentEvents = null
    ): array {
        if (empty($data)) {
            return [];
        }

        if ($concurrentEvents === null) {
            $concurrentEvents = [];
            if (!empty($start) || !empty($end)) {
                $query = Event::inPeriod($start, $end);
                if ($exceptEventId) {
                    $query = $query->where('id', '!=', $exceptEventId);
                }
                $concurrentEvents = $query->with('Materials')->get()->toArray();
            }
        }

        $periods = splitPeriods($concurrentEvents);

        foreach ($data as &$material) {
            $quantityPerPeriod = [0];
            foreach ($periods as $periodIndex => $period) {
                $overlapEvents = array_filter($concurrentEvents, function ($concurrentEvent) use ($period) {
                    return (
                        strtotime($concurrentEvent['start_date']) < strtotime($period[1]) &&
                        strtotime($concurrentEvent['end_date']) > strtotime($period[0])
                    );
                });

                $quantityPerPeriod[$periodIndex] = 0;
                foreach ($overlapEvents as $event) {
                    $eventMaterialIndex = array_search($material['id'], array_column($event['materials'], 'id'));
                    if ($eventMaterialIndex === false) {
                        continue;
                    }

                    $eventMaterial = $event['materials'][$eventMaterialIndex];
                    $quantityPerPeriod[$periodIndex] += $eventMaterial['pivot']['quantity'];
                }
            }
            $usedCount = max($quantityPerPeriod);

            $remainingQuantity = (int)$material['stock_quantity'] - (int)$material['out_of_order_quantity'];
            $material['remaining_quantity'] = max($remainingQuantity - $usedCount, 0);
        }

        return $data;
    }

    /**
     * @param integer $parkId
     *
     * @return Material[]
     */
    public static function getParkAll(int $parkId): array
    {
        return static::where('park_id', $parkId)->get()->toArray();
    }

    public static function getOneForUser(int $id, ?int $userId = null): array
    {
        $material = static::findOrFail($id);
        $materialData = $material->toArray();

        return $materialData;
    }
}
