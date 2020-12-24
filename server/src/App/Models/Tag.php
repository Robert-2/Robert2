<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Validation\Validator as V;

class Tag extends BaseModel
{
    use SoftDeletes;

    protected $searchField = 'name';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->validation = [
            'name' => V::notEmpty()->length(1, 48)
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Relations
    // —
    // ——————————————————————————————————————————————————————

    public function Persons()
    {
        return $this->morphedByMany(
            'Robert2\API\Models\Person',
            'taggable'
        );
    }

    public function Companies()
    {
        return $this->morphedByMany(
            'Robert2\API\Models\Company',
            'taggable'
        );
    }

    public function Materials()
    {
        return $this->morphedByMany(
            'Robert2\API\Models\Material',
            'taggable'
        );
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
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getIdsByNames(array $names): array
    {
        $tags = self::whereIn('name', $names)->get();
        $ids  = [];
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
        $tags = [];
        $results = [];
        foreach ($tagNames as $tagName) {
            $existingTag = self::where('name', $tagName)->first();
            if ($existingTag) {
                $results[] = $existingTag;
                continue;
            }

            $safeTag = ['name' => trim($tagName)];
            $this->validate($safeTag);

            $tags[] = $safeTag;
        }

        foreach ($tags as $tagData) {
            $results[] = self::edit(null, $tagData);
        }

        return $results;
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
