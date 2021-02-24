<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Config;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Validation\Validator as V;
use Illuminate\Database\Eloquent\Builder;

use Robert2\API\Errors;

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
            'pseudo'   => V::notEmpty()->alnum()->length(4, 100),
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
        return $this->hasMany('Robert2\API\Models\Event')
            ->select(['events.id', 'title', 'start_date', 'end_date', 'is_confirmed'])
            ->orderBy('start_date');
    }

    public function RestrictedParks()
    {
        return $this->belongsToMany('Robert2\API\Models\Park', 'user_restricted_parks')
            ->using('Robert2\API\Models\UserRestrictedParksPivot')
            ->select(['parks.id']);
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

    public function getRestrictedParksAttribute()
    {
        $restrictedParks = $this->RestrictedParks()->get();
        if (!$restrictedParks) {
            return [];
        }

        return array_map(function ($restrictedPark) {
            return (int)$restrictedPark['id'];
        }, $restrictedParks->toArray());
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAll(bool $softDeleted = false): Builder
    {
        $fields = array_merge(['id', 'pseudo', 'email', 'group_id'], $this->dates);
        return parent::getAll($softDeleted)->select($fields);
    }

    public function getLogin(string $identifier, string $password): User
    {
        $user = self::where('email', $identifier)
            ->orWhere('pseudo', $identifier)
            ->with('settings')
            ->first();

        if (!$user) {
            throw new Errors\NotFoundException;
        }

        if (!password_verify($password, $user->password)) {
            throw new Errors\NotFoundException;
        }

        unset($user->password);

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

    public function setSettings(int $userId, array $data = []): array
    {
        if (!$this->exists($userId)) {
            throw new Errors\NotFoundException("User not found, cannot modify settings.");
        }

        $UserSetting = new UserSetting();
        $settings = $UserSetting->edit($userId, $data);

        return $settings->toArray();
    }

    public function edit(?int $id = null, array $data = []): Model
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        $user = parent::edit($id, $data);
        $userId = (int)$user['id'];
        $User = self::find($userId);

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

        if (array_key_exists('restricted_parks', $data)) {
            $User->RestrictedParks()->sync($data['restricted_parks']);
        }

        unset($user['password']);

        return $user;
    }
}
