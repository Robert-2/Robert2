<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use LogicException;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

trait Cache
{
    public static function getModelCacheKey(): string
    {
        $model = alphanumericalize(class_basename(static::class));
        return sprintf('model.%s', $model);
    }

    public function getCacheKey(): string
    {
        if (!$this->id) {
            throw new LogicException("Impossible de récupérer la clé de cache d'une entité sans identifiant.");
        }
        return sprintf('%s.%d', static::getModelCacheKey(), $this->id);
    }

    public function cacheGet($scope, ?callable $callback = null)
    {
        /** @var TagAwareCacheInterface */
        $cache = container('cache');

        if (func_num_args() === 1) {
            $callback = $scope;
            $scope = null;
        }

        // - Si dirty, on ne fait pas confiance au cache.
        if ($this->isDirty()) {
            return $callback(null);
        }

        $entityCacheKey = $this->getCacheKey();
        $cacheKey = $scope
            ? sprintf('%s.%s', $entityCacheKey, $scope)
            : $entityCacheKey;

        return $cache->get(
            $cacheKey,
            function (CacheItemInterface $item) use ($callback, $entityCacheKey) {
                $item->tag([$this->getModelCacheKey(), $entityCacheKey]);
                return $callback($item);
            }
        );
    }

    /**
     * @param string|array|null $scopes
     *
     * @return boolean
     */
    public function invalidateCache($scopes = null): bool
    {
        /** @var TagAwareCacheInterface */
        $cache = container('cache');

        $entityCacheKey = $this->getCacheKey();

        // - Si pas de scope, on invalide toutes les entrées taggées avec ce modèle en particulier.
        if (empty($scopes)) {
            return $cache->invalidateTags([$entityCacheKey]);
        }

        $cacheKeys = array_map(
            function ($scope) use ($entityCacheKey) {
                return sprintf('%s.%s', $entityCacheKey, $scope);
            },
            is_array($scopes) ? $scopes : [$scopes],
        );

        $success = true;
        foreach ($cacheKeys as $cacheKey) {
            if (!$cache->delete($cacheKey)) {
                $success = false;
            }
        }

        return $success;
    }
}
