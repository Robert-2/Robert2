<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Models\BaseModel;
use Robert2\API\Models\Tag;

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

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public static function staticEdit($id = null, array $data = []): BaseModel
    {
        $entity = parent::staticEdit($id, $data);

        if (array_key_exists('tags', $data)) {
            $entity->setTags($data['tags']);
        }

        return $entity;
    }

    public function setTags(?array $tagNames): self
    {
        if (empty($tagNames)) {
            $this->tags()->sync([]);
            $this->refresh();

            return $this;
        }

        // - Filter list to keep only names
        // - in case $tagNames is in the form [{ id: number, name: string }]
        $tagNames = array_map(
            fn($tag) => (
                is_array($tag) && array_key_exists('name', $tag)
                    ? $tag['name']
                    : $tag
            ),
            $tagNames
        );

        $tags = Tag::bulkAdd($tagNames);
        $tagsIds = array_map(fn($tag) => $tag->id, $tags);
        $this->tags()->sync($tagsIds);
        $this->refresh();

        return $this;
    }
}
