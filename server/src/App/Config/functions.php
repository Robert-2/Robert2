<?php
declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Monolog\Logger;
use Loxya\Kernel;
use Respect\Validation\Validator as V;
use Loxya\Support\Period;

/**
 * Retourne le conteneur courant ou le service lié à l'id dans le conteneur si fourni.
 *
 * NOTE: À n'utiliser que dans les cas ou l'auto-wiring n'est pas disponible.
 *
 * @param string $id (optional) Un éventuel identifiant de service à retourner.
 *
 * @return mixed Le conteneur lui-même si aucun identifiant n'est passé, le service lié à l'id sinon.
 */
function container(?string $id)
{
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
function debug($message, ...$vars)
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

    container('logger')->log(Logger::DEBUG, implode(' ', $parts));
}

/**
 * Get elapsed time since php script first launched, or a custom start microtime
 *
 * @param float $start A custom start microtime.
 *
 * @return string The elapsed time, in seconds.
 */
function getExecutionTime(?float $start = null): string
{
    $start       = $start ?: (float) $_SERVER['REQUEST_TIME_FLOAT'];
    $elapsedTime = microtime(true) - $start;

    return number_format($elapsedTime, 3) . "s";
}

/**
 * Arrondi un horaire (datetime) selon une précision en minutes donnée.
 *
 * @param DateTime  $originalDate   La date à arrondir
 * @param int       $precision      La précision à utiliser. Par défaut 15 minutes. Max 60 minutes.
 *
 * @return DateTime Un clone de la date originale arrondie.
 */
function roundDate(\DateTime $originalDate, int $precision = 15): DateTime
{
    $date = clone($originalDate);
    if ($precision > 60) {
        return $date;
    }

    $steps = range(0, 60, $precision);

    $minutes = (int) $originalDate->format('i');
    if (in_array($minutes, $steps, true)) {
        return $date;
    }

    $hours = (int) $originalDate->format('H');
    $roundedMinutes = ((round($minutes / $precision)) * $precision) % 60;
    $date->setTime($hours, $roundedMinutes);

    $nextHourThreshold = 60 - ($precision / 2);
    if ($minutes < $nextHourThreshold) {
        return $date;
    }

    if ($hours === 23) {
        $date->setTime(0, 0);
        $date->add(new \DateInterval('P1D'));
        return $date;
    }

    $date->setTime($hours + 1, 0);
    return $date;
}

/**
 * Pour utiliser une transaction de DB, qui rollback les requêtes SQL en cas d'exception.
 *
 * @param callable $callback Le code effectuant les opérations sur la base de données.
 *                           (et donc qui seront rollback en cas d'erreur)
 *
 * @return mixed Le retour de la fonction de callback.
 */
function dbTransaction(callable $callback)
{
    $dbConnection = container('database')->getConnection();

    try {
        $dbConnection->beginTransaction();
        $result = $callback();
        $dbConnection->commit();
    } catch (\Exception $e) {
        $dbConnection->rollBack();
        throw $e;
    }

    return $result;
}

/**
 * Permet de récupérer une période depuis un tableau de dates.
 *
 * Si le tableau de contient pas ces clés ou que celles-ci ne sont pas valide, `null` sera retourné.
 *
 * @param array $array - Le tableau à convertir en période, deux formats sont acceptés:
 *                       - Soit `['start' => '[Date début]', 'end' => '[Date fin]']`.
 *                       - Soit `['[Date début]', '[Date fin]']`.
 *
 * @return Period|null - La période ou `null` si le tableau était invalide.
 */
function getPeriodFromArray(array $array): ?Period
{
    if (!array_key_exists('start', $array) || !array_key_exists('end', $array)) {
        $keys = array_keys($array);
        if (count($array) !== 2 || !is_numeric($keys[0]) || !is_numeric($keys[1])) {
            return null;
        }
        $array = array_combine(['start', 'end'], array_values($array));
    }

    $dateChecker = V::notEmpty()->dateTime();
    foreach (['start', 'end'] as $type) {
        if (!$dateChecker->validate($array[$type])) {
            return null;
        }
    }

    try {
        $start = (new Carbon($array['start']))->setTime(0, 0);
        $end = (new Carbon($array['end']))->setTime(23, 59, 59);
        if ($end < $start) {
            return null;
        }

        return new Period($start, $end);
    } catch (\Throwable $e) {
        return null;
    }
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
