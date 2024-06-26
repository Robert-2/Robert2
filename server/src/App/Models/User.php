<?php
declare(strict_types=1);

namespace Loxya\Models;

use Adbar\Dot as DotArray;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Loxya\Config\Config;
use Loxya\Contracts\Serializable;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Enums\BookingViewMode;
use Loxya\Models\Enums\Group;
use Loxya\Models\Traits\Serializer;
use Loxya\Models\Traits\SoftDeletable;
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
 * @property string $group
 * @property string $password
 * @property string $language
 * @property string $default_bookings_view
 * @property-read CarbonImmutable $created_at
 * @property-read CarbonImmutable|null $updated_at
 * @property-read CarbonImmutable|null $deleted_at
 *
 * @property-read Person $person
 * @property-read Beneficiary $beneficiary
 * @property-read Technician $technician
 * @property-read Collection<array-key, Event> $events
 * @property-read array<string, mixed> $settings
 *
 * @method static Builder|static search(string $term)
 */
final class User extends BaseModel implements Serializable
{
    use Serializer;
    use SoftDeletable;

    // - Types de sérialisation.
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
            'group' => V::notEmpty()->anyOf(
                V::equals(Group::ADMIN),
                V::equals(Group::MEMBER),
                V::equals(Group::VISITOR),
            ),
            'password' => V::notEmpty()->length(4, 191),
            'language' => V::optional(V::anyOf(
                V::equals('en'),
                V::equals('fr'),
            )),
            'default_bookings_view' => V::optional(V::anyOf(
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

    public function person()
    {
        return $this->hasOne(Person::class);
    }

    public function events()
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

    public function getBeneficiaryAttribute(): ?Beneficiary
    {
        if (!$this->person) {
            return null;
        }
        return $this->person->beneficiary;
    }

    public function getTechnicianAttribute(): ?Technician
    {
        if (!$this->person) {
            return null;
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

    public function hasAccessToPark(int $parkId): bool
    {
        return true;
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

    public static function staticEdit($id = null, array $data = []): static
    {
        if ($id && !static::staticExists($id)) {
            throw (new ModelNotFoundException())
                ->setModel(self::class, $id);
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        if (!$id && !isset($data['language'])) {
            $data['language'] = Config::get('defaultLang');
        }

        $personData = $data['person'] ?? [];
        unset($data['person']);

        return dbTransaction(static function () use ($id, $data, $personData) {
            $user = null;
            $userId = $id;
            $hasFailed = false;
            $validationErrors = [];

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

            return $user->refresh();
        });
    }

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(string $format = self::SERIALIZE_DEFAULT): array
    {
        $user = clone $this;

        $data = (new DotArray($user->attributesForSerialization()))
            ->delete([
                'cas_identifier',
                'saml2_identifier',
                'notifications_enabled',
                'created_at',
                'updated_at',
                'deleted_at',
            ])
            ->all();

        if ($format === self::SERIALIZE_SESSION) {
            return $data;
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
