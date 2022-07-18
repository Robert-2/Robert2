<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\QueryException;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Tag extends BaseModel
{
    use SoftDeletes;
    use Serializer {
        serialize as baseSerialize;
    }

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::callback([$this, 'checkName']),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkName($value)
    {
        V::notEmpty()
            ->length(1, 48)
            ->check($value);

        $query = static::where('name', $value);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        if ($query->withTrashed()->exists()) {
            return 'tag-name-already-in-use';
        }

        return true;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Persons()
    {
        return $this->morphedByMany(Person::class, 'taggable');
    }

    public function Materials()
    {
        return $this->morphedByMany(Material::class, 'taggable');
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = ['name' => 'string'];

    public function getPersonsAttribute()
    {
        $persons = $this->Persons()->get();
        return $persons ? $persons->toArray() : null;
    }

    public function getMaterialsAttribute()
    {
        $materials = $this->Materials()->get();
        return $materials ? $materials->toArray() : null;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Scopes
    // —
    // ——————————————————————————————————————————————————————

    public function scopeWithoutProtected(Builder $query): Builder
    {
        $protectedTags = array_values(Config::getSettings('defaultTags'));

        return $query->whereNotIn('name', $protectedTags);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getIdsByNames(array $names): array
    {
        $tags = static::whereIn('name', $names)->get();
        $ids = [];
        foreach ($tags as $tag) {
            $ids[] = $tag->id;
        }
        return $ids;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = ['name'];

    public function bulkAdd(array $tagNames = []): array
    {
        $tags = array_map(
            function ($tagName) {
                $existingTag = static::where('name', $tagName)->first();
                if ($existingTag) {
                    return $existingTag;
                }

                $tag = new static(['name' => trim($tagName)]);
                return tap($tag, function ($instance) {
                    $instance->validate();
                });
            },
            $tagNames
        );

        $this->getConnection()->transaction(function () use ($tags) {
            try {
                foreach ($tags as $tag) {
                    if (!$tag->exists || $tag->isDirty()) {
                        $tag->save();
                    }
                }
            } catch (QueryException $e) {
                throw (new ValidationException)
                    ->setPDOValidationException($e);
            }
        });

        return $tags;
    }

    // ------------------------------------------------------
    // -
    // -    Serialize
    // -
    // ------------------------------------------------------

    protected function serialize(): array
    {
        $data = $this->baseSerialize();

        unset(
            $data['createdAt'],
            $data['updatedAt'],
            $data['deletedAt'],
        );

        return $data;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Utility Methods
    // —
    // ——————————————————————————————————————————————————————

    public static function format(Collection $Tags): array
    {
        $tags = [];
        foreach ($Tags as $Tag) {
            $tags[] = [
                'id'   => $Tag->id,
                'name' => $Tag->name,
            ];
        }
        return $tags;
    }
}
