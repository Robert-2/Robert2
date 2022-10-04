<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Psr\Http\Message\UploadedFileInterface;
use Ramsey\Uuid\Uuid;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Models\Traits\Taggable;
use Robert2\API\Models\Traits\TransientAttributes;
use Robert2\API\Validation\Validator as V;

class Material extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;
    use Taggable;
    use TransientAttributes;

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

    public function checkParkId()
    {
        return V::notEmpty()->numeric();
    }

    public function checkStockQuantity()
    {
        return V::intVal()->max(100000);
    }

    public function checkOutOfOrderQuantity()
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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function park()
    {
        return $this->belongsTo(Park::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'material_attributes')
            ->using(MaterialAttributesPivot::class)
            ->withPivot('value')
            ->select(['attributes.id', 'attributes.name', 'attributes.type', 'attributes.unit']);
    }

    public function events()
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

    public function documents()
    {
        return $this->hasMany(Document::class)
            ->orderBy('name', 'asc')
            ->select(['id', 'name', 'type', 'size']);
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'tags',
        'attributes',
    ];

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
        return $this->park()->first();
    }

    public function getTagsAttribute()
    {
        return $this->tags()->get();
    }

    public function getCategoryAttribute()
    {
        return $this->category()->first();
    }

    public function getAttributesAttribute()
    {
        $attributes = $this->attributes()->get();
        if (!$attributes) {
            return null;
        }

        return array_map(
            function ($attribute) {
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
            },
            $attributes->toArray()
        );
    }

    public function getPictureRealPathAttribute()
    {
        if (empty($this->picture)) {
            return null;
        }

        // - Dans le cas d'un fichier tout juste uploadé + avant le save.
        if ($this->picture instanceof UploadedFileInterface) {
            throw new \LogicException("Impossible de récupérer le chemin de l'image avant de l'avoir persisté.");
        }

        return static::PICTURE_BASEPATH . DS . $this->picture;
    }

    public function getMissingQuantityAttribute(): int
    {
        return $this->getTransientAttribute('missing_quantity', 0);
    }

    public function getAvailableQuantityAttribute(): int
    {
        $availableQuantity = $this->getTransientAttribute('available_quantity');
        if (null !== $availableQuantity) {
            return $availableQuantity;
        }
        return (int)$this->stock_quantity - (int)$this->out_of_order_quantity;
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

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

    public function setMissingQuantityAttribute(int $value)
    {
        $this->setTransientAttribute('missing_quantity', $value);
    }

    public function setAvailableQuantityAttribute(int $value)
    {
        $this->setTransientAttribute('available_quantity', $value);
    }

    // ------------------------------------------------------
    // -
    // -    Overwritten methods
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

    public function getAllFiltered(array $conditions, bool $withDeleted = false): Builder
    {
        $parkId = array_key_exists('park_id', $conditions) ? $conditions['park_id'] : null;
        unset($conditions['park_id']);

        $builder = parent::getAllFiltered($conditions, $withDeleted);
        return $parkId ? $builder->inPark($parkId) : $builder;
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    /**
     * @param integer $parkId
     *
     * @return Collection|Material[]
     */
    public static function getParkAll(int $parkId)
    {
        return static::inPark($parkId)
            ->get();
    }

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    /**
     * Permet de récupérer uniquement le matériel lié à un parc donné.
     *
     * @param Builder $query
     * @param integer $parkId - Le parc concerné.
     *
     * @return Builder
     */
    public function scopeInPark(Builder $query, int $parkId): Builder
    {
        return $query->where(function ($query) use ($parkId) {
            $query->where(function ($subQuery) use ($parkId) {
                $subQuery
                    ->where('is_unitary', false)
                    ->where('park_id', $parkId);
            });
        });
    }

    // ------------------------------------------------------
    // -
    // -    Utils methods
    // -
    // ------------------------------------------------------

    /**
     * @param Collection|Material[] $data
     * @param string|null $start
     * @param string|null $end
     * @param integer|null $exceptEventId
     *
     * @return Collection|Material[]
     */
    public static function withAvailabilities(
        Collection $materials,
        ?string $start = null,
        ?string $end = null,
        ?int $exceptEventId = null
    ): Collection {
        if ($materials->isEmpty()) {
            return new Collection([]);
        }

        $events = [];
        if (!empty($start) || !empty($end)) {
            $query = Event::inPeriod($start, $end);
            if ($exceptEventId) {
                $query = $query->where('id', '!=', $exceptEventId);
            }
            $events = $query->with('materials')->get()->toArray();
        }

        return $materials->map(function ($material) use ($events) {
            $material = clone $material;

            $quantityPerPeriod = [0];
            $periods = splitPeriods($events);
            foreach ($periods as $periodIndex => $period) {
                $overlapEvents = array_filter($events, function ($event) use ($period) {
                    return (
                        strtotime($event['start_date']) < strtotime($period[1]) &&
                        strtotime($event['end_date']) > strtotime($period[0])
                    );
                });

                $quantityPerPeriod[$periodIndex] = 0;
                foreach ($overlapEvents as $event) {
                    $eventMaterials = array_column($event['materials'], null, 'id');
                    if (!array_key_exists($material->id, $eventMaterials)) {
                        continue;
                    }
                    $eventMaterial = $eventMaterials[$material->id];
                    $quantityPerPeriod[$periodIndex] += $eventMaterial['pivot']['quantity'];
                }
            }
            $usedCount = max($quantityPerPeriod);

            $availableQuantity = (int)$material->stock_quantity - (int)$material->out_of_order_quantity;
            $availableQuantity = max($availableQuantity - $usedCount, 0);
            $material->available_quantity = $availableQuantity;

            return $material;
        });
    }
}
