<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Robert2\API\Validation\Validator as V;

class UserSetting extends BaseModel
{
    protected $dates = [
        'created_at',
        'updated_at',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'user_id' => V::notEmpty()->intVal(),
            'language' => V::optional(V::oneOf(
                V::equals('en'),
                V::equals('fr')
            )),
            'auth_token_validity_duration' => V::optional(V::intVal()->max(744)), // - max 1 month
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAll(bool $softDeleted = false): Builder
    {
        throw new \Exception("Cannot give all settings of all users at once.");
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'user_id' => 'integer',
        'language' => 'string',
        'auth_token_validity_duration' => 'integer',
    ];

    public function getLanguageAttribute($value)
    {
        return strtolower($value);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'user_id',
        'language',
        'auth_token_validity_duration',
    ];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function editByUser(User $user, array $data = []): UserSetting
    {
        if (!$user->exists) {
            throw (new ModelNotFoundException)
                ->setModel(static::class);
        }

        $settings = static::where('user_id', $user->id)->firstOrFail();
        return static::staticEdit($settings->id, $data);
    }

    public static function staticRemove($id, array $options = []): ?BaseModel
    {
        throw new \InvalidArgumentException("User settings cannot be deleted.");
    }

    public static function staticUnremove($id): BaseModel
    {
        throw new \InvalidArgumentException("User settings cannot be restored.");
    }
}
