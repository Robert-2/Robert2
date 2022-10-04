<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Robert2\API\Contracts\Serializable;
use Robert2\API\Models\Traits\Serializer;
use Robert2\API\Validation\Validator as V;

class Tag extends BaseModel implements Serializable
{
    use SoftDeletes;
    use Serializer;

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

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function materials()
    {
        return $this->morphedByMany(Material::class, 'taggable');
    }

    // ------------------------------------------------------
    // -
    // -    Mutators
    // -
    // ------------------------------------------------------

    protected $casts = [
        'name' => 'string',
    ];

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    protected $fillable = ['name'];

    // ------------------------------------------------------
    // -
    // -    Serialization
    // -
    // ------------------------------------------------------

    public function serialize(): array
    {
        $data = $this->attributesForSerialization();

        unset(
            $data['created_at'],
            $data['updated_at'],
            $data['deleted_at'],
        );

        return $data;
    }

    // ------------------------------------------------------
    // -
    // -    "Repository" methods
    // -
    // ------------------------------------------------------

    public static function bulkAdd(array $tagNames = []): array
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

        return dbTransaction(function () use ($tags) {
            foreach ($tags as $tag) {
                if (!$tag->exists || $tag->isDirty()) {
                    $tag->save();
                    $tag->refresh();
                }
            }
            return $tags;
        });
    }
}
