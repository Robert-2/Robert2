<?php
declare(strict_types=1);

namespace Loxya\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as CoreCollection;
use Loxya\Config\Config;
use Loxya\Contracts\PeriodInterface;
use Loxya\Contracts\Serializable;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
use Loxya\Models\Traits\TransientAttributes;
use Loxya\Support\Arr;
use Loxya\Support\Assert;
use Loxya\Support\Period;
use Loxya\Support\Str;
use Psr\Http\Message\UploadedFileInterface;
use Respect\Validation\Validator as V;

/**
 * Matériel.
 *
 * @property-read ?int $id
 * @property string $name
 * @property UploadedFileInterface|string|null $picture
 * @property-read string|null $picture_real_path
 * @property string|null $description
 * @property string $reference
 * @property int|null $park_id
 * @property-read Park|null $park
 * @property int|null $category_id
 * @property-read Category|null $category
 * @property int|null $sub_category_id
 * @property-read SubCategory|null $subCategory
 * @property float|null $rental_price
 * @property float|null $replacement_price
 * @property int $stock_quantity
 * @property int $out_of_order_quantity
 * @property int $available_quantity
 * @property bool $is_hidden_on_bill
 * @property bool $is_discountable
 * @property bool $is_reservable
 * @property string|null $note
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Collection<array-key, Attribute> $attributes
 * @property-read Collection<array-key, Event> $events
 * @property-read Collection<array-key, Document> $documents
 * @property-read Collection<array-key, Tag> $tags
 *
 * @method static Builder|static search(string $term)
 * @method static Builder|static inPark(int $parkId)
 */
final class Material extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;
    use TransientAttributes;

    /** L'identifiant unique du modèle. */
    public const TYPE = 'material';

    // - Types de sérialisation.
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_WITH_AVAILABILITY = 'with-availability';
    public const SERIALIZE_DETAILS = 'details';
    public const SERIALIZE_PUBLIC = 'public';

    private const PICTURE_BASEPATH = (
        DATA_FOLDER . DS . 'materials' . DS . 'picture'
    );

    protected $attributes = [
        'name' => null,
        'description' => null,
        'reference' => null,
        'park_id' => null,
        'category_id' => null,
        'sub_category_id' => null,
        'rental_price' => null,
        'stock_quantity' => null,
        'out_of_order_quantity' => null,
        'replacement_price' => null,
        'is_hidden_on_bill' => false,
        'is_discountable' => true,
        'is_reservable' => true,
        'picture' => null,
        'note' => null,
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(2, 191),
            'reference' => V::custom([$this, 'checkReference']),
            'picture' => V::custom([$this, 'checkPicture']),
            'park_id' => V::custom([$this, 'checkParkId']),
            'category_id' => V::custom([$this, 'checkCategoryId']),
            'sub_category_id' => V::custom([$this, 'checkSubCategoryId']),
            'rental_price' => V::custom([$this, 'checkRentalPrice']),
            'stock_quantity' => V::custom([$this, 'checkStockQuantity']),
            'out_of_order_quantity' => V::custom([$this, 'checkOutOfOrderQuantity']),
            'replacement_price' => V::optional(V::floatVal()->min(0)->lessThan(1_000_000_000_000)),
            'is_hidden_on_bill' => V::optional(V::boolType()),
            'is_discountable' => V::optional(V::boolType()),
            'is_reservable' => V::optional(V::boolType()),
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

        $alreadyExists = static::query()
            ->where('reference', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'reference-already-in-use';
    }

    public function checkPicture($picture)
    {
        if (empty($picture)) {
            return true;
        }

        if (is_string($picture)) {
            V::length(5, 227)->check($picture);
            return true;
        }

        if (!($picture instanceof UploadedFileInterface)) {
            return false;
        }
        /** @var UploadedFileInterface $picture */

        if (in_array($picture->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            return 'file-exceeds-max-size';
        }

        if ($picture->getError() === UPLOAD_ERR_NO_FILE) {
            return 'no-uploaded-files';
        }

        if ($picture->getError() !== UPLOAD_ERR_OK) {
            return 'upload-failed';
        }

        if ($picture->getSize() > Config::get('maxFileUploadSize')) {
            return 'file-exceeds-max-size';
        }

        $pictureType = $picture->getClientMediaType();
        if (!in_array($pictureType, Config::get('authorizedImageTypes'), true)) {
            return 'file-type-not-allowed';
        }

        return true;
    }

    public function checkParkId($value)
    {
        V::notEmpty()->numericVal()->check($value);

        $park = Park::withTrashed()->find($value);
        if (!$park) {
            return false;
        }

        return !$this->exists || $this->isDirty('park_id')
            ? !$park->trashed()
            : true;
    }

    public function checkCategoryId($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? Category::staticExists($value)
            : true;
    }

    public function checkSubCategoryId($value)
    {
        V::optional(V::numericVal())->check($value);

        return $value !== null
            ? SubCategory::staticExists($value)
            : true;
    }

    public function checkStockQuantity()
    {
        return V::intVal()->max(100_000);
    }

    public function checkOutOfOrderQuantity()
    {
        return V::optional(V::intVal()->max(100_000));
    }

    public function checkRentalPrice()
    {
        $billingMode = Config::get('billingMode');
        if ($billingMode === 'none') {
            return V::nullType();
        }
        return V::floatVal()->min(0)->lessThan(1_000_000_000_000);
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
            ->using(MaterialAttribute::class)
            ->withPivot('value')
            ->orderByPivot('id');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_materials')
            ->using(EventMaterial::class)
            ->withPivot('id', 'quantity')
            ->orderBy('mobilization_start_date', 'desc');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'entity')
            ->orderBy('name', 'asc');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
        'reference' => 'string',
        'description' => 'string',
        'park_id' => 'integer',
        'category_id' => 'integer',
        'sub_category_id' => 'integer',
        'rental_price' => 'float',
        'stock_quantity' => 'integer',
        'out_of_order_quantity' => 'integer',
        'replacement_price' => 'float',
        'is_hidden_on_bill' => 'boolean',
        'is_discountable' => 'boolean',
        'is_reservable' => 'boolean',
        'note' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
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
        return $this->getRelationValue('park');
    }

    public function getTagsAttribute()
    {
        return $this->getRelationValue('tags');
    }

    public function getCategoryAttribute()
    {
        return $this->getRelationValue('category');
    }

    public function getAttributesAttribute()
    {
        $attributes = $this->attributes()->get();
        if (!$attributes) {
            return new Collection();
        }

        return $attributes
            ->filter(function ($attribute) {
                if ($attribute->categories->isEmpty()) {
                    return true;
                }

                return (
                    $this->category !== null &&
                    $attribute->categories->contains('id', $this->category->id)
                );
            })
            ->map(static function ($attribute) {
                $attribute->value = $attribute->pivot->value;
                return $attribute->append(['value']);
            })
            ->values();
    }

    public function getPictureAttribute($value)
    {
        if (!$value || $value instanceof UploadedFileInterface) {
            return $value;
        }

        // - Le chemin ne sera disponible qu'une fois le matériel sauvegardé.
        if (!$this->exists) {
            return null;
        }

        return (string) Config::getBaseUri()
            ->withPath(sprintf('/static/materials/%s/picture', $this->id));
    }

    public function getPictureRealPathAttribute()
    {
        $picture = $this->getAttributeFromArray('picture');
        if (empty($picture)) {
            return null;
        }

        // - Dans le cas d'un fichier tout juste uploadé...
        if ($picture instanceof UploadedFileInterface) {
            throw new \LogicException("Unable to retrieve image path before having persisted it.");
        }

        return static::PICTURE_BASEPATH . DS . $picture;
    }

    public function getAvailableQuantityAttribute(): int
    {
        $availableQuantity = $this->getTransientAttribute('available_quantity');
        if ($availableQuantity !== null) {
            return $availableQuantity;
        }
        return (int) $this->stock_quantity - (int) $this->out_of_order_quantity;
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

    public function setAvailableQuantityAttribute(int $value): void
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
                    "Le format de l'image à uploader n'est pas pris en charge.",
                );
            }

            if (!@file_exists(static::PICTURE_BASEPATH . DS . $newPicture)) {
                throw new \Exception(
                    "Une erreur est survenue lors de l'upload de l'image: " .
                    "La chaîne passée ne correspond pas à un fichier existant dans le dossier de destination.",
                );
            }
        }

        // - Si on a un nouvel upload d'image, on la déplace dans le bon dossier.
        if ($isFileUpload) {
            /** @var UploadedFileInterface $newPicture */
            $extension = pathinfo($newPicture->getClientFilename(), PATHINFO_EXTENSION);
            $filename = sprintf('%s.%s', (string) Str::uuid(), $extension);

            if (!is_dir(static::PICTURE_BASEPATH)) {
                mkdir(static::PICTURE_BASEPATH, 0777, true);
            }

            try {
                $newPicture->moveTo(static::PICTURE_BASEPATH . DS . $filename);
            } catch (\Throwable) {
                throw new \Exception(
                    "Une erreur est survenue lors de l'upload de l'image: " .
                    "L'image n'a pas pû être déplacée dans le dossier de destination.",
                );
            }

            $this->picture = $filename;
        }

        $rollbackUpload = function () use ($isFileUpload, $newPicture) {
            if (!$isFileUpload) {
                return;
            }

            try {
                $filename = $this->getAttributeFromArray('picture');
                @unlink(static::PICTURE_BASEPATH . DS . $filename);
            } catch (\Throwable) {
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
            } catch (\Throwable) {
                // NOTE: On ne fait rien si la suppression plante, le fichier sera orphelin mais le
                //       plantage de sa suppression ne justifie pas qu'on unsave le matériel, etc.
            }
        }

        return true;
    }

    public function delete()
    {
        if (!$this->exists) {
            return true;
        }
        $deleted = parent::delete();

        $filename = $this->getAttributeFromArray('picture');
        if ($this->forceDeleting && $deleted && !empty($filename)) {
            try {
                @unlink(static::PICTURE_BASEPATH . DS . $filename);
            } catch (\Throwable) {
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

    public function withAvailabilities(?PeriodInterface $period = null, bool $strict = false): static
    {
        return static::allWithAvailabilities(new Collection([$this]), $period, $strict)->get(0);
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    /**
     * @param int $parkId
     *
     * @return Collection<array-key, Material>
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

    protected $orderable = [
        'name',
        'reference',
        'rental_price',
        'stock_quantity',
        'out_of_order_quantity',
    ];

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(static fn (Builder $subQuery) => (
            $subQuery
                ->orWhere('name', 'LIKE', $term)
                ->orWhere('reference', 'LIKE', $term)
        ));
    }

    /**
     * Permet de récupérer uniquement le matériel lié à un parc donné.
     *
     * @param Builder $query
     * @param int $parkId - Le parc concerné.
     */
    public function scopeInPark(Builder $query, int $parkId): Builder
    {
        return $query->where(static function (Builder $query) use ($parkId) {
            $query->where(static function ($subQuery) use ($parkId) {
                $subQuery
                    ->where('park_id', $parkId);
            });
        });
    }

    public function scopeCustomOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        if (!in_array($column, ['stock_quantity', 'out_of_order_quantity'], true)) {
            return parent::scopeCustomOrderBy($query, $column, $direction);
        }

        if ($column === 'stock_quantity') {
            return $query
                ->orderBy(
                    $query->raw('stock_quantity'),
                    $direction,
                );
        }

        if ($column === 'out_of_order_quantity') {
            return $query
                ->orderBy(
                    $query->raw('out_of_order_quantity'),
                    $direction,
                );
        }

        return $query;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes utilitaires
    // -
    // ------------------------------------------------------

    /**
     * Permet de récupérer la collection de matériel passée en argument, dans laquelle
     * sont injectées les données de disponibilités, pour une période donnée.
     *
     * Si un événement, une réservation ou un panier est fourni en tant que `$period`, son propre
     * matériel sera exclu du calcul des disponibilités.
     *
     * Ces disponibilités dépendent de la valeur du paramètre `$period` qui peut contenir:
     * - Soit une instance implémentant `PeriodInterface` dont les dates seront utilisées pour les dispos.
     * - Soit `null` si les disponibilités doivent être récupérées sans prendre en compte de période.
     *
     * @param Collection<array-key, Material> $materials La liste du matériel.
     * @param PeriodInterface|null $period Le booking (ou simple Period) à utiliser comme limite de temps.
     * @param bool $strict Passer à `true` pour prendre en compte le matériel en panne.
     *
     * @return Collection<array-key, Material>
     */
    public static function allWithAvailabilities(
        Collection $materials,
        ?PeriodInterface $period = null,
        bool $strict = false,
    ): Collection {
        if ($materials->isEmpty()) {
            return new Collection([]);
        }

        // - NOTE : Ne pas prefetch le materiel des bookables via `->with()`,
        //   car cela peut surcharger la mémoire rapidement.
        // FIXME: Utiliser le principe du lazy-loading pou optimiser l'utilisation de la mémoire.
        $otherBorrowings = new Collection();
        if ($period !== null) {
            $otherBorrowings = $period->__cachedConcurrentBookables ?? null;
            if ($otherBorrowings === null) {
                $otherBorrowings = (new Collection())
                    // - Événements.
                    ->concat(
                        Event::inPeriod($period)
                            ->when(
                                $period instanceof Event && $period->exists,
                                static function (Builder $query) use ($period) {
                                    /** @var Event $period */
                                    $query->where('id', '!=', $period->id);
                                },
                            )
                            ->get(),
                    );
            }

            /** @var Collection $otherBorrowings */
            $otherBorrowings = $otherBorrowings
                ->sortBy(static fn (PeriodInterface $otherBorrowing) => $otherBorrowing->getStartDate())
                ->values();
        }

        // - Groupe les bookings concurrents par périodes pour pouvoir
        //   ensuite récupérer les périodes de sortie des matériels.
        $otherBorrowingsByPeriods = $otherBorrowings
            ->reduce(
                static fn ($dates, $otherBorrowing) => $dates->push(
                    $otherBorrowing->getStartDate()->format('Y-m-d H:i:s'),
                    $otherBorrowing->getEndDate()->format('Y-m-d H:i:s'),
                ),
                new CoreCollection(),
            )
            ->unique()
            ->sort(static function ($a, $b) {
                if ($a === $b) {
                    return 0;
                }
                return strtotime($a) < strtotime($b) ? -1 : 1;
            })
            ->values()
            ->sliding(2)
            ->mapSpread(static function ($startDate, $endDate) use ($otherBorrowings) {
                $period = new Period($startDate, $endDate);
                return $otherBorrowings->filter(static fn ($otherBorrowing) => (
                    $period->overlaps($otherBorrowing)
                ));
            });

        // - Optimisation: Plus utilisé après et potentiellement volumineux.
        unset($otherBorrowings);

        // - Récupération des quantités utilisées pour chaque
        //   matériel pendant la période pour utilisation ultérieure.
        $materialsUsage = new CoreCollection([]);
        foreach ($otherBorrowingsByPeriods as $periodIndex => $otherBorrowingsPeriod) {
            foreach ($otherBorrowingsPeriod as $otherBorrowing) {
                $borrowingMaterials = $otherBorrowing instanceof Event
                    ? $otherBorrowing->materials->keyBy('id')->all()
                    : $otherBorrowing->materials->keyBy('material_id')->all();

                foreach ($borrowingMaterials as $materialId => $borrowingMaterial) {
                    $quantity = $borrowingMaterial->pivot->quantity;

                    // - Si le matériel était déjà présent dans une autre période.
                    $existingUsage = $materialsUsage->get($materialId);
                    $quantities = $existingUsage['quantities'] ?? [];
                    if ($existingUsage !== null) {
                        $quantity += $quantities[$periodIndex] ?? 0;
                    }

                    $materialsUsage->put($materialId, [
                        'quantities' => array_replace($quantities, [$periodIndex => $quantity]),
                    ]);
                }
            }
        }

        // - Optimisation: Plus utilisé après et potentiellement volumineux.
        unset($otherBorrowingsByPeriods);

        return $materials->map(static function ($material) use ($materialsUsage) {
            $material = clone $material;
            $materialUsage = $materialsUsage->get($material->id, [
                'quantities' => [0],
            ]);

            $usedCount = max($materialUsage['quantities']);

            $availableQuantity = (int) $material->stock_quantity - (int) $material->out_of_order_quantity;
            $availableQuantity = max($availableQuantity - $usedCount, 0);
            $material->available_quantity = $availableQuantity;

            return $material;
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        /** @var Material $material */
        $material = tap(clone $this, static function (Material $material) use ($format) {
            $material->append(['tags', 'attributes']);

            if (in_array($format, [self::SERIALIZE_WITH_AVAILABILITY, self::SERIALIZE_PUBLIC], true)) {
                $material->append('available_quantity');
            }
        });

        $data = $material->attributesForSerialization();

        if ($format === self::SERIALIZE_PUBLIC) {
            return Arr::only($data, [
                'id',
                'name',
                'description',
                'picture',
                'available_quantity',
                'rental_price',
            ]);
        }

        return Arr::except($data, ['is_unitary', 'park_location_id', 'deleted_at']);
    }
}
