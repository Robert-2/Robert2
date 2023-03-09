<?php
declare(strict_types=1);

namespace Robert2\API\Models\Traits;

use LogicException;
use Robert2\API\Config\Config;
use Robert2\Support\Str;
use Symfony\Contracts\Cache\ItemInterface as CacheItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

trait Cache
{
    public static function getModelCacheKey(): string
    {
        $model = Str::slug(class_basename(static::class));
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
        /** @var TagAwareCacheInterface $cache */
        $cache = container('cache');

        if (func_num_args() === 1) {
            $callback = $scope;
            $scope = null;
        }

        // - Si dirty, on ne fait pas confiance au cache.
        if ($this->isDirty()) {
            return $callback(null);
        }

        // - Si on est dans un environnement de test, on ne met pas réellement en cache.
        if (Config::getEnv() === 'test') {
            return $callback(null);
        }

        $entityCacheKey = $this->getCacheKey();
        $cacheKey = $scope
            ? sprintf('%s.%s', $entityCacheKey, $scope)
            : $entityCacheKey;

        return $cache->get(
            $cacheKey,
            function (CacheItemInterface $item) use ($callback, $entityCacheKey, $cacheKey) {
                debug('Création de l\'entrée de cache de modèle `%s`.', $cacheKey);
                $item->tag([static::getModelCacheKey(), $entityCacheKey]);
                return $callback($item);
            }
        );
    }

    /**
     * @param string|array|null $scopes
     *
     * @return bool
     */
    public function invalidateCache($scopes = null): bool
    {
        /** @var TagAwareCacheInterface $cache */
        $cache = container('cache');

        $entityCacheKey = $this->getCacheKey();

        // - Si pas de scope, on invalide toutes les entrées taguées avec ce modèle en particulier.
        if (empty($scopes)) {
            debug('Invalidation de toutes les entrées de cache du modèle #%s.', $this->id);
            return $cache->invalidateTags([$entityCacheKey]);
        }

        $cacheKeys = array_map(
            function ($scope) use ($entityCacheKey) {
                return sprintf('%s.%s', $entityCacheKey, $scope);
            },
            is_array($scopes) ? $scopes : [$scopes],
        );
        debug('Invalidation de(s) l\'entrée(s) de cache de modèle `%s`.', implode('`,`', $cacheKeys));

        $success = true;
        foreach ($cacheKeys as $cacheKey) {
            if (!$cache->delete($cacheKey)) {
                $success = false;
            }
        }

        return $success;
    }
}
