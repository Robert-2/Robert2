<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Validation\Validator as V;
use Robert2\API\Errors\ValidationException;

class Setting extends BaseModel
{

    protected $primaryKey = 'key';

    public $incrementing = false;
    public $timestamps = false;

    protected $availableKeys = [
        'event_summary_material_display_mode',
        'event_summary_custom_text_title',
        'event_summary_custom_text',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'key' => V::callback([$this, 'checkKey']),
            'value' => V::callback([$this, 'checkValue']),
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

        return in_array($keyName, $this->availableKeys);
    }

    public function checkValue()
    {
        $valuesValidation = [
            'event_summary_material_display_mode' => V::notEmpty()->oneOf(
                V::equals('categories'),
                V::equals('sub-categories'),
                V::equals('parks'),
                V::equals('flat')
            ),
            'event_summary_custom_text_title' => V::optional(
                V::length(null, 191)
            ),
            'event_summary_custom_text' => null,
        ];

        if (!array_key_exists($this->key, $valuesValidation)) {
            return false;
        }

        if (!$valuesValidation[$this->key]) {
            return true;
        }

        return $valuesValidation[$this->key];
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

    public static function getList(): array
    {
        $settings = static::all();
        $settingsList = [];
        foreach ($settings as $setting) {
            $settingsList[$setting->key] = $setting->value;
        }
        return $settingsList;
    }

    public static function getWithKey(string $key): ?string
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : null;
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
        foreach ($data as $key => $value) {
            try {
                $model = static::find($key);
                if (empty($model)) {
                    $errors['key'] = ["This setting does not exists."];
                    continue;
                }
                $value = $value ? trim($value) : $value;
                $model->value = ($value === '') ? null : $value;
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
}
