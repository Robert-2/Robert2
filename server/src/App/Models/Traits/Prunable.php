<?php
declare(strict_types=1);

namespace Loxya\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static static|Builder prunable()
 */
trait Prunable
{
    /**
     * Supprime toutes les entités obsolètes du modèles.
     *
     * @param int $chunkSize La taille de chaque passe de suppression.
     *
     * @return int Le nombre d'éléments supprimés au total.
     */
    public function pruneAll(int $chunkSize = 1000): int
    {
        $total = 0;

        $isSoftDeletable = in_array(
            SoftDeletes::class,
            class_uses_recursive(static::class),
            true
        );

        static::prunable()
            ->when($isSoftDeletable, function ($query) {
                $query->withTrashed();
            })
            ->chunkById($chunkSize, function ($models) use (&$total, $isSoftDeletable) {
                foreach ($models as $model) {
                    if ($isSoftDeletable) {
                        $model->forceDelete();
                    } else {
                        $model->delete();
                    }
                }
                $total += $models->count();
            });

        return $total;
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes abstraites
    // -
    // ------------------------------------------------------

    abstract public function scopePrunable(Builder $builder): Builder;
}
