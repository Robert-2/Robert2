<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Robert2\API\Models\Tag;

/**
 * @property-read Collection|Tag[] $tags
 */
trait Taggable
{
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getAllFilteredOrTagged(array $conditions, array $tags = [], bool $withDeleted = false): Builder
    {
        $otherArgs = array_slice(func_get_args(), 3);
        $builder = call_user_func_array(
            [$this, 'getAllFiltered'],
            array_merge([$conditions, $withDeleted], $otherArgs)
        );

        if (!empty($tags)) {
            $builder = $builder->whereHas('tags', function ($query) use ($tags) {
                $query->whereIn('name', $tags);
            });
        }

        return $builder;
    }
}
