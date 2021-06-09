<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use BigFish\PDF417\PDF417;
use BigFish\PDF417\Renderers\SvgRenderer;
use Robert2\API\Validation\Validator as V;

class MaterialUnit extends BaseModel
{
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'park_id' => V::notEmpty()->numeric(),
            'reference' => V::notEmpty()->alnum('-+/*.')->length(2, 64),
            'serial_number' => V::optional(V::alnum('-+/*.')->length(2, 64)),
            'person_id' => V::optional(V::numeric()),
            'is_broken' => V::optional(V::boolType()),
            'is_lost' => V::optional(V::boolType()),
            'material_unit_state_id' => V::optional(V::numeric()),
            'purchase_date' => V::optional(V::date()),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'owner',
        'state',
    ];

    public function Material()
    {
        return $this->belongsTo('Robert2\API\Models\Material');
    }

    public function Park()
    {
        return $this->belongsTo('Robert2\API\Models\Park');
    }

    public function EventMaterials()
    {
        $relation = $this->belongsToMany(
            'Robert2\API\Models\EventMaterial',
            'event_material_units',
            'material_unit_id',
            'event_material_id'
        );
        return $relation->using('Robert2\API\Models\EventMaterialUnit');
    }

    public function MaterialUnitState()
    {
        return $this->belongsTo('Robert2\API\Models\MaterialUnitState');
    }

    public function Person()
    {
        return $this->belongsTo('Robert2\API\Models\Person');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'park_id' => 'integer',
        'material_id' => 'integer',
        'reference' => 'string',
        'serial_number' => 'string',
        'person_id' => 'integer',
        'is_broken' => 'boolean',
        'is_lost' => 'boolean',
        'material_unit_state_id' => 'integer',
        'purchase_date' => 'string',
        'notes' => 'string',
    ];

    public function getMaterialAttribute()
    {
        $material = $this->Material()->first();
        return $material ? $material->toArray() : null;
    }

    public function getParkAttribute()
    {
        return $this->park()->first();
    }

    public function getBarcodeAttribute()
    {
        if (!$this->id || !$this->material) {
            return null;
        }

        $params = array_map(
            function ($id) {
                return str_pad((string)$id, 11, '0', STR_PAD_LEFT);
            },
            [$this->material['id'], $this->id]
        );

        try {
            $code = sprintf('^#[%s]#$', implode('|', $params));
            $barcode = (new PDF417())->encode($code);

            // - Calcule le ratio idéal vu le nombre de lignes du barcode.
            for ($ratio = 5; $ratio > 1; $ratio--) {
                if (($ratio * $barcode->rows) <= 30) {
                    break;
                }
            }

            $renderer = new SvgRenderer([
                'scale' => 1,
                'ratio' => $ratio,
                'padding' => 0,
            ]);
            $svg = $renderer->render($barcode);
        } catch (\Throwable $e) {
            throw new \RuntimeException(sprintf(
                "Impossible de générer le code barre pour la référence \"%s\".",
                $this->reference
            ));
        }

        return sprintf('data:image/svg+xml;base64,%s', base64_encode($svg));
    }

    public function getStateAttribute()
    {
        $state = $this->MaterialUnitState()->first();
        return $state ? $state->toArray() : null;
    }

    public function getOwnerAttribute()
    {
        $owner = $this->Person()->first();
        return $owner ? $owner->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'park_id',
        'reference',
        'serial_number',
        'person_id',
        'is_broken',
        'is_lost',
        'material_unit_state_id',
        'purchase_date',
        'notes',
    ];

    public function setReferenceAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['reference'] = $value;
    }

    public function setSerialNumberAttribute($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        $this->attributes['serial_number'] = $value;
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public function remove(int $id, array $options = []): ?BaseModel
    {
        $entity = static::findOrFail($id);

        if (!$entity->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the record %d.", $id));
        }

        return null;
    }
}
