<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Eloquence\Behaviours\CamelCasing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
use Robert2\API\Validation\Validator as V;

class ListTemplate extends BaseModel
{
    use SoftDeletes;
    use CamelCasing;

    protected $orderField = 'name';

    protected $allowedSearchFields = ['name'];
    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(2, 100),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Materials()
    {
        $fields = [
            'materials.id',
            'name',
            'reference',
            'is_unitary',
            'park_id',
            'category_id',
            'sub_category_id',
            'rental_price',
            'stock_quantity',
            'out_of_order_quantity',
            'replacement_price',
            'is_hidden_on_bill',
            'is_discountable',
        ];

        return $this->belongsToMany('Robert2\API\Models\Material', 'list_template_materials')
            ->using('Robert2\API\Models\ListTemplateMaterial')
            ->withPivot('id', 'quantity')
            ->select($fields);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'description' => 'string',
    ];

    public function getMaterialsAttribute()
    {
        $materials = $this->Materials()->get();
        return $materials ?: null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public static function getParks(int $id): array
    {
        $listTemplate = static::with('Materials')->find($id);
        if (!$listTemplate) {
            return [];
        }

        $materialParks = [];
        foreach ($listTemplate['materials'] as $material) {
            if ($material['is_unitary']) {
                foreach ($material['units'] as $unit) {
                    $materialParks[] = $unit['park_id'];
                };
                continue;
            }
            $materialParks[] = $material['park_id'];
        };

        return array_values(array_unique($materialParks));
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Data scopes
    // —
    // ——————————————————————————————————————————————————————

    public function scopeForAll(Builder $query): Builder
    {
        return $query->select(['id', 'name', 'description']);
    }

    public function scopeForOne(Builder $query): Builder
    {
        return $query->select(['id', 'name', 'description']);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'name',
        'description',
    ];

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class(), $id);
        }

        try {
            $listTemplate = static::firstOrNew(compact('id'));

            $data = cleanEmptyFields($data);
            $data = $listTemplate->_trimStringFields($data);

            $listTemplate->fill($data)->validate()->save();

            if (isset($data['materials'])) {
                if (!is_array($data['materials'])) {
                    throw new \InvalidArgumentException("La clé 'materials' doit être un tableau.");
                }
                $listTemplate->syncMaterials($data['materials']);
            }
        } catch (QueryException $e) {
            throw (new ValidationException)
                ->setPDOValidationException($e);
        }

        return $listTemplate->refresh();
    }

    public function syncMaterials(array $materialsData)
    {
        $materials = [];
        $materialsUnits = [];
        foreach ($materialsData as $materialData) {
            if ((int)$materialData['quantity'] <= 0) {
                continue;
            }

            try {
                $material = Material::findOrFail($materialData['id']);

                $unitIds = [];
                if ($material->is_unitary && !empty($materialData['units'])) {
                    $unitIds = $materialData['units'];
                    if (!is_array($unitIds)) {
                        throw new \InvalidArgumentException(
                            sprintf(
                                "Le format des unités sélectionnées pour le matériel ref. \"%s\" est invalide.",
                                $material->reference
                            ),
                            ERROR_VALIDATION
                        );
                    }

                    foreach ($unitIds as $unitId) {
                        $unit = MaterialUnit::findOrFail($unitId);
                        if ($unit->material_id !== $material->id) {
                            throw new \InvalidArgumentException(
                                vsprintf(
                                    "L'unité ref. \"%s\", sélectionnée pour le matériel " .
                                    "ref. \"%s\" n'appartient pas à celui-ci.",
                                    [$unit->reference, $material->reference]
                                ),
                                ERROR_VALIDATION
                            );
                        }
                    }
                }

                $materialsUnits[$materialData['id']] = $unitIds;
                $materials[$materialData['id']] = [
                    'quantity' => $materialData['quantity']
                ];
            } catch (ModelNotFoundException $e) {
                throw new \InvalidArgumentException(
                    "Un ou plusieurs matériels (ou des unités de ceux-ci) ajoutés à l'événement n'existent pas.",
                    ERROR_VALIDATION
                );
            }
        }

        $this->Materials()->sync($materials);

        // - Synchronisation des unités
        $materials = $this->Materials()->get();
        foreach ($materials as $material) {
            $units = $materialsUnits[$material->id] ?? [];
            $material->pivot->Units()->sync($units);
        }
    }
}
