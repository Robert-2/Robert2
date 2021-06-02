<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Validation\Validator as V;

class Setting extends BaseModel
{
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'event_summary_material_display_mode' => V::notEmpty()->oneOf(
                V::equals('sub-categories'),
                V::equals('parks'),
                V::equals('flat')
            ),
            'event_summary_custom_text_title' => V::optional(V::length(null, 191)),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'event_summary_material_display_mode' => 'string',
        'event_summary_custom_text_title' => 'string',
        'event_summary_custom_text' => 'string',
    ];

    public static function getList(): array
    {
        $settingsModel = static::findOrFail(1);
        return $settingsModel->toArray();
    }

    public static function getCurrent(string $setting)
    {
        $settings = (static::findOrFail(1))->toArray();
        return $settings[$setting] ?? null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'event_summary_material_display_mode',
        'event_summary_custom_text_title',
        'event_summary_custom_text',
    ];

    public function edit(?int $id = null, array $data = []): BaseModel
    {
        if (!$id) {
            throw (new ModelNotFoundException)->setModel(get_class($this));
        }

        return parent::edit($id, $data);
    }

    public function remove(int $id, array $options = []): ?BaseModel
    {
        throw new \InvalidArgumentException("Settings cannot be deleted.");
    }

    public function unremove(int $id): BaseModel
    {
        return static::findOrFail($id);
    }
}
