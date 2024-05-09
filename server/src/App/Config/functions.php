<?php
declare(strict_types=1);

use DI\Container;
use Illuminate\Database\Eloquent\Builder;
use Loxya\Config\Config;
use Loxya\Kernel;
use Monolog\Level as LogLevel;
use Slim\Interfaces\RouteParserInterface;

/**
 * Retourne le conteneur courant ou le service lié à l'id dans le conteneur si fourni.
 *
 * NOTE: À n'utiliser que dans les cas ou l'auto-wiring n'est pas disponible.
 *
 * @param string $id (optional) Un éventuel identifiant de service à retourner.
 *
 * @return mixed Le conteneur lui-même si aucun identifiant n'est passé, le service lié à l'id sinon.
 */
function container(?string $id = null): mixed
{
    /** @var Container $container */
    $container = Kernel::get()->getContainer();
    return $id ? $container->get($id) : $container;
}

/**
 * Ajoute une entrée de log de type "debug".
 *
 * Le fonctionnement de cette fonction est similaire à celui de la fonction `sprintf`.
 * (Uniquement dans le cas ou `$message` est une chaîne de caractères)
 *
 * @param mixed $message    Le message ou la variable à logger.
 * @param string[] ...$vars Les variables utilisées pour remplir les placeholders de `$message`.
 *                          Voir le fonctionnement de `sprintf()`.
 *
 * @codeCoverageIgnore
 */
function debug($message, ...$vars): void
{
    $parts = [];

    if (!is_string($message)) {
        $caller = debug_backtrace()[0];
        $parts[] = sprintf("[%s:%d]", basename($caller['file']), $caller['line']);
    }

    if (is_string($message)) {
        $message = !empty($vars) ? vsprintf($message, $vars) : $message;
    } elseif ($message instanceof Builder) {
        $message = $message->toSql();
    } else {
        $message = var_export($message, true);
    }
    $parts[] = $message;

    container('logger')->log(LogLevel::Debug, implode(' ', $parts));
}

/**
 * Récupère le temps écoulé depuis le lancement du script PHP,
 * ou depuis un timestamp de départ personnalisé.
 *
 * @param float $start Un timestamp de départ personnalisé.
 *
 * @return string Le temps écoulé, en secondes.
 */
function getExecutionTime(?float $start = null): string
{
    $start = $start ?: (float) $_SERVER['REQUEST_TIME_FLOAT'];
    $elapsedTime = microtime(true) - $start;

    return number_format($elapsedTime, 3) . 's';
}

/**
 * Pour utiliser une transaction de DB, qui rollback les requêtes SQL en cas d'exception.
 *
 * @param callable $callback Le code effectuant les opérations sur la base de données.
 *                           (et donc qui seront rollback en cas d'erreur)
 *
 * @return mixed Le retour de la fonction de callback.
 */
function dbTransaction(callable $callback): mixed
{
    $dbConnection = container('database')->getConnection();

    try {
        $dbConnection->beginTransaction();
        $result = $callback();
        $dbConnection->commit();
    } catch (\Throwable $e) {
        $dbConnection->rollBack();
        throw $e;
    }

    return $result;
}

/**
 * Traduit une clé de traduction pour la langue courante.
 *
 * ATTENTION, cette fonction n'est à utiliser que dans de rares cas, il faut
 * privilégier l'injection de dépendance quand c'est possible.
 *
 * @param string $key La clé de traduction à utiliser
 *
 * @return string - La traduction, ou la clé elle-même si non trouvée.
 */
function __(string $key): string
{
    return container('i18n')->translate($key);
}

/**
 * Retourne l'URL absolue d'une route nommée, en incluant le chemin de base.
 *
 * /!\ Attention: Cette fonction est uniquement utilisable dans un contexte
 *                d'application avec router (et donc pas dans les applications
 *                console !!)
 *
 * @param string                $routeName   Le nom de la route
 * @param array<string, string> $data        Les arguments nommés de la route.
 * @param array<string, string> $queryParams Paramètres de "query" éventuels.
 *
 * @return string L'URL absolue correspondante à la route.
 *
 * @throws RuntimeException  Si la route nommée n'existe pas.
 * @throws LogicException Si nous ne sommes pas dans un context routé (cf. description).
 * @throws InvalidArgumentException Si des données requises n'ont pas été fournies.
 */
function urlFor(string $routeName, array $data = [], array $queryParams = []): string
{
    /** @var Container $container */
    $container = container();

    if (!$container->has(RouteParserInterface::class)) {
        throw new \LogicException("`urlFor()` cannot be called in non-routed contexts.");
    }

    /** @var RouteParserInterface $routeParser */
    $routeParser = $container->get(RouteParserInterface::class);
    return $routeParser->fullUrlFor(Config::getBaseUri(), $routeName, $data, $queryParams);
}
