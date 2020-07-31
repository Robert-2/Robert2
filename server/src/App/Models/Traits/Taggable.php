<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

use Robert2\API\Errors;
use Robert2\API\Models\Tag;

trait Taggable
{
    public function Tags()
    {
        return $this->morphToMany('Robert2\API\Models\Tag', 'taggable')
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
        $builder = $this->_getOrderBy();

        foreach ($conditions as $field => $value) {
            $builder = $builder->where($field, $value);
        }

        if (!empty($this->_searchTerm)) {
            $builder = $this->_setSearchConditions($builder);
        }

        if (!empty($tags)) {
            $builder = $builder->whereHas('tags', function ($query) use ($tags) {
                $query->whereIn('name', $tags);
            });
        }

        if ($withDeleted) {
            $builder = $builder->onlyTrashed();
        }

        return $builder;
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function edit(?int $id = null, array $data = []): Model
    {
        $Model = parent::edit($id, $data);

        if (array_key_exists('tags', $data)) {
            $this->setTags($Model['id'], $data['tags']);
        }

        return $Model;
    }

    public function setTags(int $id, ?array $tagNames): array
    {
        $Model = self::find($id);
        if (!$Model) {
            throw new Errors\NotFoundException;
        }

        if (empty($tagNames)) {
            $Model->Tags()->sync([]);
            return $Model->tags;
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

        $Model->Tags()->sync($tagsIds);
        return $Model->tags;
    }

    public function addTag(int $id, string $tagName): array
    {
        $Model = self::find($id);
        $tagName = trim($tagName);

        if (!$Model || empty($tagName)) {
            throw new Errors\NotFoundException;
        }

        $Tag = Tag::firstOrCreate(['name' => $tagName]);

        $Model->Tags()->attach($Tag->id);
        return $Model->tags;
    }
}
