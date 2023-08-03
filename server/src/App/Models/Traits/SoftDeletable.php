<?php
declare(strict_types=1);

namespace Loxya\Models\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;
use Loxya\Models\BaseModel;

trait SoftDeletable
{
    use SoftDeletes;

    public static function staticDelete($id): bool|null
    {
        return static::withTrashed()->find($id)?->delete();
    }

    public static function staticForceDelete($id): bool|null
    {
        return static::withTrashed()->find($id)?->forceDelete();
    }

    public static function staticRestore($id): BaseModel
    {
        $entity = static::onlyTrashed()->findOrFail($id);
        if (!$entity->restore()) {
            throw new \RuntimeException(sprintf("Unable to restore the record %d.", $id));
        }
        return $entity;
    }
}
