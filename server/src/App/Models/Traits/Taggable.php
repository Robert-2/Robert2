<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Robert2\API\Models\BaseModel;
use Robert2\API\Models\Tag;

trait Taggable
{
    public function Tags()
    {
        return $this->morphToMany(Tag::class, 'taggable')
            ->select(['id', 'name']);
    }

    public function getTagsAttribute()
    {
        $tags = $this->Tags()->get();
        return Tag::format($tags);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getAllFilteredOrTagged(array $conditions, array $tags = [], bool $withDeleted = false): Builder
    {
        $builder = $this->getAllFiltered($conditions, $withDeleted);

        if (!empty($tags)) {
            $builder = $builder->whereHas('tags', function ($query) use ($tags) {
                $query->whereIn('name', $tags);
            });
        }

        return $builder;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function edit(?int $id = null, array $data = []): BaseModel
    {
        $entity = parent::edit($id, $data);

        if (array_key_exists('tags', $data)) {
            $this->setTags($entity['id'], $data['tags']);
        }

        return $entity;
    }

    public function setTags(int $id, ?array $tagNames): array
    {
        $entity = static::findOrFail($id);

        if (empty($tagNames)) {
            $entity->Tags()->sync([]);
            return $entity->tags;
        }

        // - Filter list to keep only names
        // - in case $tagNames is in the form [{ id: number, name: string }]
        $tagNames = array_map(function ($tag) {
            return (is_array($tag) && array_key_exists('name', $tag)) ? $tag['name'] : $tag;
        }, $tagNames);

        $Tag = new Tag();
        $Tags = $Tag->bulkAdd($tagNames);
        $tagsIds = [];
        foreach ($Tags as $Tag) {
            $tagsIds[] = $Tag->id;
        }

        $entity->Tags()->sync($tagsIds);
        return $entity->tags;
    }

    public function addTag(int $id, string $tagName): array
    {
        $entity = static::findOrFail($id);

        $tagName = trim($tagName);
        if (empty($tagName)) {
            throw new \InvalidArgumentException("The new tag should not be empty.");
        }

        $Tag = Tag::firstOrCreate(['name' => $tagName]);

        $entity->Tags()->attach($Tag->id);
        return $entity->tags;
    }
}
