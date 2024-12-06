<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Loxya\Config\Config;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Enums\BookingViewMode;
use Loxya\Models\Enums\Group;
use Loxya\Models\Traits\Serializer;
use Loxya\Support\Arr;
use Loxya\Support\Assert;
use Respect\Validation\Validator as V;

/**
 * Utilisateur de l'application.
 *
 * @property-read ?int $id
 * @property string $pseudo
 * @property-read string $first_name
 * @property-read string $last_name
 * @property-read string $full_name
 * @property string $email
 * @property-read string|null $phone
 * @property-read string|null $street
 * @property-read string|null $postal_code
 * @property-read string|null $locality
 * @property-read int|null $country_id
 * @property-read Country|null $country
 * @property-read string|null $full_address
 * @property string $group
 * @property string $password
 * @property string $language
 * @property string $default_bookings_view
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Person|null $person
 * @property-read Beneficiary|null $beneficiary
 * @property-read Technician|null $technician
 * @property-read Collection<array-key, Event> $events
 * @property-read array<string, mixed> $settings
 *
 * @method static Builder|static search(string $term)
 */
final class User extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletes;

    // - Types de sérialisation.
    public const SERIALIZE_SUMMARY = 'summary';
    public const SERIALIZE_DEFAULT = 'default';
    public const SERIALIZE_DETAILS = 'details';
    public const SERIALIZE_SETTINGS = 'settings';
    public const SERIALIZE_SESSION = 'session';

    // - Champs spécifiques aux settings utilisateur.
    public const SETTINGS_ATTRIBUTES = [
        'language',
        'default_bookings_view',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'pseudo' => V::custom([$this, 'checkPseudo']),
            'email' => V::custom([$this, 'checkEmail']),
            'group' => V::custom([$this, 'checkGroup']),
            'password' => V::notEmpty()->length(4, 191),
            'language' => V::nullable(V::anyOf(
                V::equals('en'),
                V::equals('fr'),
            )),
            'default_bookings_view' => V::nullable(V::anyOf(
                V::equals(BookingViewMode::CALENDAR->value),
                V::equals(BookingViewMode::LISTING->value),
            )),
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
            ->alnum('-', '_', '.')
            ->length(4, 100)
            ->check($value);

        $alreadyExists = static::query()
            ->where('pseudo', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'user-pseudo-already-in-use';
    }

    public function checkGroup($value)
    {
        return V::create()
            ->notEmpty()
            ->anyOf(
                V::equals(Group::ADMINISTRATION),
                V::equals(Group::MANAGEMENT),
                V::equals(Group::READONLY_PLANNING_GENERAL),
                V::equals(Group::READONLY_PLANNING_SELF),
            )
            ->validate($value);
    }

    public function checkEmail($value)
    {
        V::notEmpty()
            ->email()
            ->length(5, 191)
            ->check($value);

        $alreadyExists = static::query()
            ->where('email', $value)
            ->when($this->exists, fn (Builder $subQuery) => (
                $subQuery->where('id', '!=', $this->id)
            ))
            ->withTrashed()
            ->exists();

        return !$alreadyExists ?: 'user-email-already-in-use';
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function person(): HasOne
    {
        return $this->hasOne(Person::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class)
            ->orderBy('mobilization_start_date');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $appends = [
        'first_name',
        'last_name',
        'full_name',
        'phone',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'pseudo' => 'string',
        'email' => 'string',
        'group' => 'string',
        'password' => 'string',
        'language' => 'string',
        'default_bookings_view' => 'string',
        'created_at' => 'immutable_datetime',
        'updated_at' => 'immutable_datetime',
        'deleted_at' => 'immutable_datetime',
    ];

    public function getFirstNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->first_name;
    }

    public function getLastNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->last_name;
    }

    public function getFullNameAttribute(): string
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->full_name;
    }

    public function getPhoneAttribute(): string|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->phone;
    }

    public function getStreetAttribute(): string|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->street;
    }

    public function getPostalCodeAttribute(): string|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->postal_code;
    }

    public function getLocalityAttribute(): string|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->locality;
    }

    public function getCountryIdAttribute(): int|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->country_id;
    }

    public function getCountryAttribute(): Country|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->country;
    }

    public function getFullAddressAttribute(): string|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The beneficiary\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->full_address;
    }

    public function getBeneficiaryAttribute(): Beneficiary|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->beneficiary;
    }

    public function getTechnicianAttribute(): Technician|null
    {
        if (!$this->person) {
            throw new \LogicException(
                'The user\'s related person is missing, ' .
                'this relation should always be defined.',
            );
        }
        return $this->person->technician;
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
        'language',
        'default_bookings_view',
    ];

    // ------------------------------------------------------
    // -
    // -    Query Scopes
    // -
    // ------------------------------------------------------

    protected $orderable = [
        'pseudo',
        'email',
        'group',
    ];

    public function scopeSearch(Builder $query, string $term): Builder
    {
        Assert::minLength($term, 2, "The term must contain more than two characters.");

        $term = sprintf('%%%s%%', addcslashes($term, '%_'));
        return $query->where(static function (Builder $query) use ($term) {
            $query
                ->orWhere(static function (Builder $subQuery) use ($term) {
                    $subQuery
                        ->orWhere('pseudo', 'LIKE', $term)
                        ->orWhere('email', 'LIKE', $term);
                })
                ->orWhereHas('person', static function (Builder $subQuery) use ($term) {
                    $subQuery
                        ->where('first_name', 'LIKE', $term)
                        ->orWhere('last_name', 'LIKE', $term)
                        ->orWhereRaw('CONCAT(last_name, \' \', first_name) LIKE ?', [$term])
                        ->orWhereRaw('CONCAT(first_name, \' \', last_name) LIKE ?', [$term]);
                });
        });
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes liées à une "entity"
    // -
    // ------------------------------------------------------

    public function edit(array $data): static
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        if (!$this->exists && !isset($data['language'])) {
            $data['language'] = Config::get('defaultLang');
        }

        $personData = $data['person'] ?? [];
        unset($data['person']);

        return dbTransaction(function () use ($data, $personData) {
            $hasFailed = false;
            $validationErrors = [];

            try {
                $this->fill($data)->save();
                $personData['email'] = $this->email;
            } catch (ValidationException $e) {
                $validationErrors = $e->getValidationErrors();
                $hasFailed = true;
            }

            // - Personne
            try {
                Person::updateOrCreate(['user_id' => $this->id], $personData);
            } catch (ValidationException $e) {
                $hasFailed = true;
                $validationErrors = array_merge($validationErrors, [
                    'person' => $e->getValidationErrors(),
                ]);
            }

            if ($hasFailed) {
                throw new ValidationException($validationErrors);
            }

            return $this->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes de "repository"
    // -
    // ------------------------------------------------------

    public static function fromLogin(string $identifier, string $password): User
    {
        $user = static::where('email', $identifier)
            ->orWhere('pseudo', $identifier)
            ->firstOrFail();

        if (!password_verify($password, $user->password)) {
            throw new ModelNotFoundException(static::class);
        }

        return $user;
    }

    public static function fromEmail(string $email): ?User
    {
        return static::where('email', $email)->first();
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        $user = tap(clone $this, static function (User $user) use ($format) {
            if (in_array($format, [self::SERIALIZE_SESSION, self::SERIALIZE_DETAILS], true)) {
                $user->append([
                    'street',
                    'postal_code',
                    'locality',
                    'country_id',
                    'country',
                    'full_address',
                ]);
            }
        });

        $data = new DotArray($user->attributesForSerialization());
        $data->delete([
            'cas_identifier',
            'saml2_identifier',
            'notifications_enabled',
            'created_at',
            'updated_at',
            'deleted_at',
        ]);

        $data = $data->all();

        if ($format === self::SERIALIZE_SESSION) {
            return $data;
        }

        if ($format === self::SERIALIZE_SUMMARY) {
            return Arr::only($data, ['id', 'full_name', 'email']);
        }

        return $format === self::SERIALIZE_SETTINGS
            ? Arr::only($data, self::SETTINGS_ATTRIBUTES)
            : Arr::except($data, self::SETTINGS_ATTRIBUTES);
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
