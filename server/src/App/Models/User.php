<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Errors\ValidationException;
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
            'pseudo' => V::callback([$this, 'checkPseudo']),
            'email' => V::callback([$this, 'checkEmail']),
            'group_id' => V::notEmpty()->oneOf(
                V::equals('admin'),
                V::equals('member'),
                V::equals('visitor')
            ),
            'password' => V::notEmpty()->length(4, 191),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkPseudo($value)
    {
        V::notEmpty()
            ->alnum('-', '_')
            ->length(4, 100)
            ->check($value);

        $query = static::where('pseudo', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'user-pseudo-already-in-use';
        }

        return true;
    }

    public function checkEmail($value)
    {
        V::notEmpty()
            ->email()
            ->length(5, 191)
            ->check($value);

        $query = static::where('email', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'user-email-already-in-use';
        }

        return true;
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
        return $this->hasOne(Person::class);
    }

    public function Settings()
    {
        return $this->hasOne(UserSetting::class);
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
        return $this->hasMany(Event::class)
            ->select($selectFields)
            ->orderBy('start_date');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'pseudo' => 'string',
        'email' => 'string',
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

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException)
                ->setModel(get_class(), $id);
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        $personData = !empty($data['person']) && is_array($data['person']) ? $data['person'] : [];
        unset($data['person']);

        return dbTransaction(function () use ($id, $data, $personData) {
            $userId = $id;
            $validationErrors = [];

            try {
                $user = static::updateOrCreate(compact('id'), $data);
                $userId = $user->id;
            } catch (ValidationException $e) {
                $validationErrors = $e->getValidationErrors();
            }

            try {
                Person::updateOrCreate(['user_id' => $userId], $personData);
            } catch (ValidationException $e) {
                $validationErrors = array_merge($validationErrors, [
                    'person' => $e->getValidationErrors(),
                ]);
            }

            if (!empty($validationErrors)) {
                throw (new ValidationException())
                    ->setValidationErrors($validationErrors);
            }

            if (!$id) {
                $settings = container('settings');
                $defaultSettings = [
                    'language' => strtoupper($settings['defaultLang']),
                    'auth_token_validity_duration' => $settings['sessionExpireHours']
                ];
                UserSetting::updateOrCreate(['user_id' => $userId], $defaultSettings);
            }

            return $user;
        });
    }
}
