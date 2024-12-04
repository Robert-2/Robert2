<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Illuminate\Support\Str;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Enums\PublicCalendarPeriodDisplay;
use Respect\Validation\Validator as V;

/**
 * Configuration de l'application.
 *
 * @property string $key
 * @property mixed $value
 */
final class Setting extends BaseModel
{
    protected $primaryKey = 'key';

    public $incrementing = false;
    public $timestamps = false;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'key' => V::custom([$this, 'checkKey']),
            'value' => V::custom([$this, 'checkValue']),
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
                'validation' => V::custom(static fn ($value) => (
                    V::create()
                        ->notEmpty()
                        ->anyOf(
                            V::equals('categories'),
                            V::equals('sub-categories'),
                            V::equals('parks'),
                            V::equals('flat'),
                        )
                        ->validate($value)
                )),
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
            'eventSummary.showReplacementPrices' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => true,
            ],
            'eventSummary.showDescriptions' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => false,
            ],
            'eventSummary.showTags' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => false,
            ],
            'eventSummary.showPictures' => [
                'type' => 'boolean',
                'validation' => V::boolVal(),
                'sensitive' => false,
                'default' => false,
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
                'default' => (string) Str::uuid(),
            ],
            'calendar.public.displayedPeriod' => [
                'type' => 'string',
                'validation' => V::custom(static fn ($value) => (
                    V::create()
                        ->notEmpty()
                        ->anyOf(
                            V::equals(PublicCalendarPeriodDisplay::MOBILIZATION),
                            V::equals(PublicCalendarPeriodDisplay::OPERATION),
                            V::equals(PublicCalendarPeriodDisplay::BOTH),
                        )
                        ->validate($value)
                )),
                'sensitive' => false,
                'default' => PublicCalendarPeriodDisplay::OPERATION,
            ],

            //
            // - Inventaires de retour
            //

            'returnInventory.mode' => [
                'type' => 'string',
                'validation' => V::custom(static fn ($value) => (
                    V::create()
                        ->notEmpty()
                        ->anyOf(
                            V::equals('start-empty'),
                            V::equals('start-full'),
                        )
                        ->validate($value)
                )),
                'sensitive' => false,
                'default' => 'start-empty',
            ],

            //
            // - Facturation
            //

            'billing.defaultTax' => [
                'type' => 'reference',
                'model' => Tax::class,
                'validation' => V::custom(static function ($value) {
                    V::nullable(V::intVal())->check($value);
                    return $value === null || Tax::includes($value);
                }),
                'sensitive' => false,
                'default' => null,
            ],
            'billing.defaultDegressiveRate' => [
                'type' => 'reference',
                'model' => DegressiveRate::class,
                'validation' => V::custom(static function ($value) {
                    V::nullable(V::intVal())->check($value);
                    return $value === null || DegressiveRate::includes($value);
                }),
                'sensitive' => false,
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
        return in_array($keyName, array_keys(static::manifest()), true);
    }

    public function checkValue()
    {
        $manifest = static::manifest();
        if (!array_key_exists($this->key, $manifest)) {
            return false;
        }
        return $manifest[$this->key]['validation'] ?? true;
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    protected $casts = [
        'key' => 'string',
        'value' => 'string',
    ];

    public function getValueAttribute($value)
    {
        $allManifests = static::manifest();
        if (!array_key_exists($this->key, $allManifests)) {
            return $value;
        }
        $manifest = $allManifests[$this->key];

        if ($value === null) {
            return $value;
        }

        $type = $manifest['type'] ?? 'string';
        switch ($type) {
            case 'boolean':
                return filter_var($value, \FILTER_VALIDATE_BOOLEAN);

            case 'reference':
                if (!array_key_exists('model', $manifest)) {
                    throw new \LogicException(sprintf("Missing model for reference field \"%s\".", $this->key));
                }

                /** @var BaseModel $model */
                $model = $manifest['model'];
                return $model::find((int) $value)->getKey();

            case 'integer':
                return (int) $value;

            case 'string':
                return $value;

            default:
                throw new \LogicException(sprintf("Unsupported data type: %s", $type));
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

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = ['value'];

    public function reset(): void
    {
        $manifest = static::manifest();
        if (!array_key_exists($this->key, $manifest)) {
            throw new \LogicException(
                sprintf("The configuration of the key `%s` is missing in the manifest.", $this->key),
            );
        }

        $this->value = $manifest[$this->key]['default'];
        $this->save();
        $this->refresh();
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function bulkEdit(array $data): static
    {
        $errors = [];

        if (!empty($data)) {
            foreach ((new DotArray($data))->flatten() as $key => $value) {
                try {
                    $model = static::find($key);
                    if (empty($model)) {
                        $errors[$key] = "This setting does not exists.";
                        continue;
                    }

                    $value = is_string($value) ? trim($value) : $value;
                    $model->value = $value === '' ? null : $value;
                    $model->save();
                } catch (ValidationException $e) {
                    $errors[$key] = $e->getValidationErrors()['value'];
                }
            }
        }

        if (count($errors) > 0) {
            throw new ValidationException($errors);
        }

        return new static();
    }

    // ------------------------------------------------------
    // -
    // -    Overwritten methods
    // -
    // ------------------------------------------------------

    public function delete()
    {
        throw new \LogicException('Settings cannot be deleted.');
    }

    // ------------------------------------------------------
    // -
    // -    Internal
    // -
    // ------------------------------------------------------

    protected static function allTraversable($withSensitive = true): DotArray
    {
        $settings = new DotArray();

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
