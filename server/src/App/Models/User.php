<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Config;
use Robert2\API\Validation\Validator as V;

class User extends BaseModel
{
    use SoftDeletes;

    protected $orderField = 'pseudo';

    protected $allowedSearchFields = ['pseudo', 'email'];
    protected $searchField = 'pseudo';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'pseudo'   => V::notEmpty()->alnum('-', '_')->length(4, 100),
            'email'    => V::notEmpty()->email()->length(5, 191),
            'group_id' => V::notEmpty()->oneOf(
                V::equals('admin'),
                V::equals('member'),
                V::equals('visitor')
            ),
            'password' => V::notEmpty()->length(4, 191),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    protected $appends = [
        'person',
    ];

    public function Person()
    {
        return $this->hasOne('Robert2\API\Models\Person');
    }

    public function Settings()
    {
        return $this->hasOne('Robert2\API\Models\UserSetting');
    }

    public function Events()
    {
        $selectFields = [
            'events.id',
            'title',
            'start_date',
            'end_date',
            'is_confirmed',
            'is_archived',
        ];
        return $this->hasMany('Robert2\API\Models\Event')
            ->select($selectFields)
            ->orderBy('start_date');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'pseudo'   => 'string',
        'email'    => 'string',
        'group_id' => 'string',
        'password' => 'string',
    ];

    public function getPersonAttribute()
    {
        $person = $this->Person()->first();
        return $person ? $person->toArray() : null;
    }

    public function getSettingsAttribute()
    {
        $settings = $this->Settings()->first();
        return $settings ? $settings->toArray() : null;
    }

    public function getEventsAttribute()
    {
        $events = $this->Events()->get();
        return $events ? $events->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    protected $hidden = ['password'];

    public function getAll(bool $softDeleted = false): Builder
    {
        $fields = array_merge(['id', 'pseudo', 'email', 'group_id'], $this->dates);
        return parent::getAll($softDeleted)->select($fields);
    }

    public static function fromLogin(string $identifier, string $password): User
    {
        $user = static::where('email', $identifier)
            ->orWhere('pseudo', $identifier)
            ->with('settings')
            ->firstOrFail();

        if (!password_verify($password, $user->password)) {
            throw new ModelNotFoundException(static::class);
        }

        return $user;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'pseudo',
        'email',
        'group_id',
        'password',
    ];

    public function edit($id = null, array $data = []): BaseModel
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        $user = parent::edit($id, $data);
        $userId = (int)$user['id'];
        $User = static::find($userId);

        if (!$id) {
            $settings = Config\Config::getSettings();
            $User->Settings()->updateOrCreate(
                ['user_id' => $userId],
                [
                    'language'                     => strtoupper($settings['defaultLang']),
                    'auth_token_validity_duration' => $settings['sessionExpireHours']
                ]
            );
        }

        if (!empty($data['person'])) {
            $User->Person()->updateOrCreate(
                ['user_id' => $userId],
                $data['person']
            );
        }

        unset($user['password']);

        return $user;
    }
}
