<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Adbar\Dot as DotArray;
use Robert2\API\Validation\Validator as V;
use Robert2\API\Errors\ValidationException;

class Setting extends BaseModel
{
    protected $primaryKey = 'key';

    public $incrementing = false;
    public $timestamps = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'key' => V::callback([$this, 'checkKey']),
            'value' => V::callback([$this, 'checkValue']),
        ];
    }

    protected static function manifest()
    {
        // NOTE: Penser à mettre à jour le store côté client lorsque les settings sont modifiées.
        return [
            //
            // - Fiche de sortie événement
            //

            'eventSummary.materialDisplayMode' => [
                'type' => 'string',
                'validation' => V::notEmpty()->oneOf(
                    V::equals('categories'),
                    V::equals('sub-categories'),
                    V::equals('parks'),
                    V::equals('flat')
                ),
                'sensitive' => false,
                'default' => 'sub-categories',
            ],
            'eventSummary.customText.title' => [
                'type' => 'string',
                'validation' => V::optional(V::length(null, 191)),
                'sensitive' => false,
                'default' => null,
            ],
            'eventSummary.customText.content' => [
                'type' => 'string',
                'validation' => null,
                'sensitive' => false,
                'default' => null,
            ],
            'eventSummary.showLegalNumbers' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => true,
            ],

            //
            // - Calendrier
            //

            'calendar.event.showLocation' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => true,
            ],
            'calendar.event.showBorrower' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => false,
            ],
            'calendar.public.enabled' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => false,
            ],
            'calendar.public.uuid' => [
                'type' => 'string',
                'validation' => V::Uuid(4),
                'sensitive' => true,
                'default' => null,
            ],
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkKey(string $keyName)
    {
        if (empty($keyName)) {
            return false;
        }
        return in_array($keyName, array_keys(static::manifest()));
    }

    public function checkValue()
    {
        $manifest = static::manifest();
        if (!array_key_exists($this->key, $manifest)) {
            return false;
        }
        return $manifest[$this->key]['validation'] ?? true;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'key' => 'string',
        'value' => 'string',
    ];

    public function getValueAttribute($value)
    {
        $manifest = static::manifest();
        if (!array_key_exists($this->key, $manifest)) {
            return $value;
        }

        if ($value === null) {
            return $value;
        }

        $type = $manifest[$this->key]['type'] ?? 'string';
        switch ($type) {
            case 'boolean':
                return in_array($value, ['1', 'true', true], true);

            case 'string':
                return $value;

            default:
                throw new \LogicException(sprintf("Type de données non pris en charge : %s", $type));
        }
    }

    public static function getList($withSensitive = true): array
    {
        return static::allTraversable($withSensitive)->all();
    }

    public static function getWithKey(string $path)
    {
        return static::allTraversable()->get($path);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = ['value'];

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if (empty($data)) {
            throw new \InvalidArgumentException("No setting to update", ERROR_VALIDATION);
        }

        $errors = [];
        foreach ((new DotArray($data))->flatten() as $key => $value) {
            try {
                $model = static::find($key);
                if (empty($model)) {
                    $errors['key'] = ["This setting does not exists."];
                    continue;
                }

                $value = is_string($value) ? trim($value) : $value;
                $model->value = $value === '' ? null : $value;
                $model->validate()->save();
            } catch (ValidationException $error) {
                $errors[$key] = $error->getValidationErrors()['value'];
            }
        }

        if (count($errors) > 0) {
            $exception = new ValidationException();
            $exception->setValidationErrors($errors);
            throw $exception;
        }

        return new static;
    }

    public function remove($id, array $options = []): ?BaseModel
    {
        throw new \InvalidArgumentException("Settings cannot be deleted.");
    }

    public function unremove($id): BaseModel
    {
        throw new \InvalidArgumentException("Settings cannot be restored.");
    }

    // ------------------------------------------------------
    // -
    // -    Internal
    // -
    // ------------------------------------------------------

    protected static function allTraversable($withSensitive = true): DotArray
    {
        $settings = new DotArray;

        foreach (static::all() as $setting) {
            $settings->set($setting->key, $setting->value);
        }

        foreach (static::manifest() as $key => $meta) {
            if ($meta['sensitive'] && !$withSensitive) {
                $settings->delete($key);
                continue;
            }

            if (!$settings->has($key)) {
                $settings->set($key, $meta['default']);
            }
        }

        return $settings;
    }
}
