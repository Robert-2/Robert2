<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Model;
use Respect\Validation\Validator as V;
use Illuminate\Database\Eloquent\Builder;

use Robert2\API\Errors;

class UserSetting extends BaseModel
{
    protected $table = 'user_settings';

    protected $_modelName = 'UserSetting';
    protected $_orderField = 'id';
    protected $_orderDirection = 'asc';

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    public function __construct()
    {
        parent::__construct();

        $this->validation = [
            'user_id'  => V::notEmpty()->intVal(),
            'language' => V::optional(V::oneOf(
                V::equals('EN'),
                V::equals('FR')
            )),
            'auth_token_validity_duration' => V::optional(V::intVal()->max(744)), // - max 1 month
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $softDeleted = false): Builder
    {
        throw new \Exception(
            "Cannot give all settings of all users at once.",
            ERROR_NOT_ALLOWED
        );
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'user_id'                      => 'integer',
        'language'                     => 'string',
        'auth_token_validity_duration' => 'integer',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'user_id',
        'language',
        'auth_token_validity_duration'
    ];

    public function edit(?int $userId = null, array $data = []): Model
    {
        if (!$userId) {
            throw new Errors\NotFoundException("Cannot edit settings of an unknown user, please provide user id.");
        }

        $model = $this->where('user_id', $userId)->first();
        if (!$model) {
            throw new Errors\NotFoundException("User not found to edit settings of.");
        }

        return parent::edit($model->id, $data);
    }

    // - Prevents the deletion of a user's settings
    public function remove(int $id, array $options = []): ?Model
    {
        return null;
    }
}
