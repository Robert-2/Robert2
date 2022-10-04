<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Adbar\Dot as DotArray;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Config\Config;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Enums\Group;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class User extends BaseModel implements Serializable
{
    use Serializer;
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
            'group' => V::notEmpty()->oneOf(
                V::equals(Group::ADMIN),
                V::equals(Group::MEMBER),
                V::equals(Group::VISITOR)
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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function person()
    {
        return $this->hasOne(Person::class);
    }

    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }

    public function events()
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

    protected $appends = [
        'first_name',
        'last_name',
        'full_name',
        'phone',
    ];

    protected $hidden = [
        'cas_identifier',
        'password',
    ];

    protected $casts = [
        'pseudo' => 'string',
        'email' => 'string',
        'group' => 'string',
        'password' => 'string',
    ];

    public function getLanguageAttribute(): string
    {
        $language = Config::getSettings('defaultLang');
        if ($this->settings && $this->settings->language) {
            $language = $this->settings->language;
        }
        return strtolower($language);
    }

    public function getFirstNameAttribute(): ?string
    {
        if (!$this->person) {
            return null;
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): ?string
    {
        if (!$this->person) {
            return null;
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute(): ?string
    {
        if (!$this->person) {
            return null;
        }
        return $this->person->full_name;
    }

    public function getPhoneAttribute(): ?string
    {
        if (!$this->person) {
            return null;
        }
        return $this->person->phone;
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAll(bool $softDeleted = false): Builder
    {
        $fields = array_merge(['id', 'pseudo', 'email', 'group'], $this->dates);
        return parent::getAll($softDeleted)->select($fields);
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = [
        'pseudo',
        'email',
        'group',
        'password',
        'cas_identifier',
    ];

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

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

        $personData = $data['person'] ?? [];
        unset($data['person']);

        return dbTransaction(function () use ($id, $data, $personData) {
            $userId = $id;
            $validationErrors = [];
            $hasFailed = false;

            try {
                $user = static::updateOrCreate(compact('id'), $data);
                $userId = $user->id;
            } catch (ValidationException $e) {
                $validationErrors = $e->getValidationErrors();
                $hasFailed = true;
            }

            try {
                Person::updateOrCreate(['user_id' => $userId], $personData);
            } catch (ValidationException $e) {
                $hasFailed = true;
                $validationErrors = array_merge($validationErrors, [
                    'person' => $e->getValidationErrors(),
                ]);
            }

            if ($hasFailed) {
                throw new ValidationException($validationErrors);
            }

            if (!$id) {
                $settings = container('settings');
                $defaultSettings = [
                    'language' => $settings['defaultLang'],
                    'auth_token_validity_duration' => $settings['sessionExpireHours']
                ];
                UserSetting::updateOrCreate(['user_id' => $userId], $defaultSettings);
            }

            return $user->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        $data = new DotArray($this->attributesForSerialization());

        $data->delete([
            'created_at',
            'updated_at',
            'deleted_at',
        ]);

        return $data->all();
    }

    public static function serializeValidation(array $data): array
    {
        $data = new DotArray($data);

        foreach (['first_name', 'last_name', 'phone'] as $field) {
            $originalPath = sprintf('person.%s', $field);
            if ($data->has($originalPath) && !$data->has($field)) {
                $data->set($field, $data->get($originalPath));
            }
            $data->delete($originalPath);
        }

        if ($data->isEmpty('person')) {
            $data->delete('person');
        }

        return $data->all();
    }

    public static function unserialize(array $data): array
    {
        $data = new DotArray($data);

        // - On supprime l'éventuel sous-object `person` dans le payload, non attendu sous cette forme.
        //   (les données de la personne liée sont fusionnées avec les données de l'user)
        $data->delete('person');

        foreach (['first_name', 'last_name', 'phone'] as $field) {
            $originalPath = sprintf('person.%s', $field);
            if ($data->has($field)) {
                $data->set($originalPath, $data->get($field));
                $data->delete($field);
            }
        }

        return $data->all();
    }
}
