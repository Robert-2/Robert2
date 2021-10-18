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
            'reference' => V::notEmpty()->alnum('-+/*._')->length(2, 64),
            'serial_number' => V::optional(V::alnum('-+/*._')->length(2, 64)),
            'person_id' => V::optional(V::numeric()),
            'is_broken' => V::optional(V::boolType()),
            'is_lost' => V::optional(V::boolType()),
            'state' => V::callback([$this, 'checkState']),
            'purchase_date' => V::optional(V::date()),
        ];
    }

    public function checkState($value)
    {
        $isValueValid = ($value || is_numeric($value)) && MaterialUnitState::staticExists($value);
        return $isValueValid ?: 'invalid-value';
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

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
            EventMaterial::class,
            'event_material_units',
            'material_unit_id',
            'event_material_id'
        );
        return $relation->using(EventMaterialUnit::class);
    }

    public function ListTemplateMaterials()
    {
        $relation = $this->belongsToMany(
            ListTemplateMaterial::class,
            'list_template_material_units',
            'material_unit_id',
            'list_template_material_id'
        );
        return $relation->using(ListTemplateMaterialUnit::class);
    }

    public function MaterialUnitState()
    {
        return $this->belongsTo('Robert2\API\Models\MaterialUnitState', 'state');
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

    protected $appends = ['owner'];

    protected $casts = [
        'park_id' => 'integer',
        'material_id' => 'integer',
        'reference' => 'string',
        'serial_number' => 'string',
        'person_id' => 'integer',
        'is_broken' => 'boolean',
        'is_lost' => 'boolean',
        'state' => 'string',
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

    public function getOwnerAttribute()
    {
        $owner = $this->Person()->first();
        return $owner ? $owner->toArray() : null;
    }

    public function getUsedByAttribute()
    {
        $eventMaterialsIds = EventMaterialUnit::where('material_unit_id', $this->id)
            ->pluck('event_material_id');
        $eventsIds = EventMaterial::whereIn('id', $eventMaterialsIds)
            ->pluck('event_id');
        $events = Event::whereIn('id', $eventsIds)
            ->orderBy('start_date', 'desc')
            ->pluck('title');

        $listTemplateMaterialsIds = ListTemplateMaterialUnit::where('material_unit_id', $this->id)
            ->pluck('list_template_material_id');
        $listTemplatesIds = ListTemplateMaterial::whereIn('id', $listTemplateMaterialsIds)
            ->pluck('list_template_id');
        $listTemplates = ListTemplate::whereIn('id', $listTemplatesIds)
            ->orderBy('name', 'asc')
            ->pluck('name');

        return [
            'events' => $events->toArray(),
            'listTemplates' => $listTemplates->toArray(),
        ];
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
        'state',
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

    public function remove($id, array $options = []): ?BaseModel
    {
        $entity = static::findOrFail($id);

        if (!$entity->delete()) {
            throw new \RuntimeException(sprintf("Unable to delete the record %d.", $id));
        }

        return null;
    }
}
