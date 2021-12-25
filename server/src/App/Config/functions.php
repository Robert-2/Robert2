<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Monolog\Logger;
use Psr\Http\Message\UploadedFileInterface;
use Robert2\API\Kernel;

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
 * Print a variable, and exit current script (or not)
 *
 * Options:
 * - `log` (bool): Wether to log the debug in `/var/log` instead of direct output (default `false`)
 *
 * @param mixed $var     Variable to monitor.
 * @param array $options See "Options" above.
 *
 * @return void
 *
 * @codeCoverageIgnore
 */
function debug($var = null, array $options = []): void
{
    $options = array_merge(['log' => false], $options);

    if ($var instanceof Builder) {
        $var = $var->toSql();
    }

    if ($options['log']) {
        $caller = debug_backtrace()[0];
        $displayVar = !is_string($var)
            ? var_export($var, true)
            : $var;

        $debug = sprintf(
            "[%s:%d] %s",
            basename($caller['file']),
            $caller['line'],
            $displayVar
        );
        container('logger')->log(Logger::DEBUG, $debug);
        return;
    }

    if ($options['log'] === 'only') {
        return;
    }

    $wrap = ['<pre>', '</pre>'];
    if (in_array(PHP_SAPI, ['cli', 'phpdbg'], true)) {
        $wrap = ["\n\033[35m", "\033[0m\n"];
    }

    echo $wrap[0];
    if (is_array($var) || is_object($var) || is_callable($var)) {
        print_r($var);
    } elseif (is_string($var)) {
        echo $var;
    } else {
        var_dump($var);
    }
    echo $wrap[1];
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
    $start       = $start ?: (float)$_SERVER['REQUEST_TIME_FLOAT'];
    $elapsedTime = microtime(true) - $start;

    return number_format($elapsedTime, 3) . "s";
}

/**
 * Transform any snake_case string into camelCase string
 *
 * @param string $str                   The string to transform.
 * @param bool   $capitalizeFirstLetter Wether to capitalize the first letter or not.
 *
 * @return string
 */
function snakeToCamelCase(string $str, bool $capitalizeFirstLetter = false): string
{
    $string = str_replace('_', '', ucwords($str, '_'));

    if (!$capitalizeFirstLetter) {
        return lcfirst($string);
    }

    return $string;
}

/**
 * Transforme une chaîne de caractère en snake_case.
 *
 * @return string
 */
function snakeCase(string $value): string
{
    if (ctype_lower($value)) {
        return $value;
    }

    $value = preg_replace('/\s+/u', '', ucwords($value));
    $value = preg_replace('/(.)(?=[A-Z])/u', '$1_', $value);
    return mb_strtolower($value, 'UTF-8');
}

/**
 * Transform any spaces (normal & unbreakable) in a string into underscores
 *
 * @param string $str The string to transform.
 *
 * @return string
 */
function slugify(string $str): string
{
    return preg_replace('/\s|\xc2\xa0/', '_', $str);
}

/**
 * Set all empty fields of an array to null
 *
 * @param array $data The array to clean.
 *
 * @return array
 */
function cleanEmptyFields(array $data): array
{
    return array_map(function ($value) {
        return ($value === '') ? null : $value;
    }, $data);
}

/**
 * Permet de normaliser un numéro de téléphone.
 *
 * @param string $phone Le numéro de téléphone à normaliser.
 *
 * @return string Le numéro de téléphone normalisé.
 */
function normalizePhone(string $phone): string
{
    return preg_replace('/ /', '', $phone);
}

function alphanumericalize(string $string): string
{
    return (new Cocur\Slugify\Slugify())
        ->slugify($string, ['separator' => '-']);
}

/**
 * Set all empty fields of an array to null
 *
 * @param QueryException $e The PDO Exception thrown
 *
 * @return bool
 */
function isDuplicateException(QueryException $e): bool
{
    if ($e->getCode() != '23000') {
        return false;
    }

    $details = $e->getMessage();
    $subCode = explode(' ', explode(': ', $details)[2]);

    return $subCode[0] == '1062';
}

function splitPeriods(array $slots): array
{
    $normalizeDate = function ($date, $defaultTime) {
        if (!($date instanceof \DateTime)) {
            $parsedTime = date_parse($date);
            if (!$parsedTime || $parsedTime['error_count'] > 0) {
                throw new \InvalidArgumentException(
                    sprintf("La date \"%s\" est invalide.", $date)
                );
            }

            $date = new \DateTime($date);
            if ($parsedTime['hour'] === false) {
                $timeParts = array_map('intval', explode(':', $defaultTime));
                call_user_func_array([$date, 'setTime'], $timeParts);
            }
        }
        return $date->format('Y-m-d H:i');
    };

    $timeLine = [];
    foreach ($slots as $slot) {
        $timeLine[] = $normalizeDate($slot['start_date'], '00:00');
        $timeLine[] = $normalizeDate($slot['end_date'], '23:59');
    }

    $timeLine = array_unique($timeLine);
    $timeLineCount = count($timeLine);
    if ($timeLineCount < 2) {
        return [];
    }

    usort($timeLine, function ($dateTime1, $dateTime2) {
        if ($dateTime1 === $dateTime2) {
            return 0;
        }
        return strtotime($dateTime1) < strtotime($dateTime2) ? -1 : 1;
    });

    $periods = [];
    for ($i = 0; $i < $timeLineCount - 1; $i++) {
        $periods[] = [$timeLine[$i], $timeLine[$i + 1]];
    }

    return $periods;
}

/**
 * Déplace un fichier uploaded dans le dossier des data en sécurisant son nom
 *
 * @param string                $directory    Dossier dans lequel placer le fichier (sera créé si inexistant)
 * @param UploadedFileInterface $uploadedFile Le fichier à placer
 *
 * @return string Le nom du fichier résultant.
 */
function moveUploadedFile($directory, UploadedFileInterface $uploadedFile)
{
    $name = $uploadedFile->getClientFilename();

    $slugify = new Cocur\Slugify\Slugify([
        'regexp' => '/([^A-Za-z0-9\.]|-)+/',
        'lowercase' => false,
    ]);
    $nameSecure = $slugify->slugify($name);

    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    $uploadedFile->moveTo($directory . DS . $nameSecure);

    return $nameSecure;
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

    $minutes = (int)$originalDate->format('i');
    if (in_array($minutes, $steps)) {
        return $date;
    }

    $hours = (int)$originalDate->format('H');
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
