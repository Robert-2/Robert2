<?php
declare(strict_types=1);

use Robert2\API\Config\Config;
use Slim\Http\Headers;
use Slim\Http\Response;

/**
 * Check wether current run is in TEST mode
 *
 * @return bool True if script is running in TEST mode
 */
function isTestMode(): bool
{
    return getenv('PHP_ROBERT2_TESTING') === 'TESTS';
}

/**
 * Print a variable, and exit current script (or not)
 *
 * @param var mixed: Variable to monitor
 * @param options array: Options:
 *   - `log` (bool): Wether to log the debug in `/var/log` instead of direct output (default `false`)
 *   - `append` (bool): Wether to append to log file instead of replace (default `true`)
 * @return void
 *
 * @codeCoverageIgnore
 */
function debug($var = null, array $options = []): void
{
    $options = array_merge([
        'log' => false,
        'append' => true,
    ], $options);

    if ($options['log']) {
        $backtrace = debug_backtrace();
        $caller = array_shift($backtrace);

        $debug = sprintf(
            "%s [%s] line %d: %s\n",
            date('d/m H:i'),
            basename($caller['file']),
            $caller['line'],
            print_r($var, true)
        );
        $logFile = VAR_FOLDER . DS . 'logs' . DS . 'debug.log';
        file_put_contents($logFile, $debug, $options['append'] ? FILE_APPEND : 0);
        return;
    }

    $wrap = ['<pre>', '</pre>'];
    if (isTestMode()) {
        $wrap = ["\n\033[35m", "\033[0m\n"];
    }

    echo $wrap[0];
    if (is_array($var) || is_object($var) || is_callable($var)) {
        print_r($var);
    } else {
        var_dump($var);
    }
    echo $wrap[1];
}

/**
 * Add a line into SQL logs file
 *
 * @param var Builder: the Eloquent Query builder
 * @return void
 *
 * @codeCoverageIgnore
 */
function logSql($builder): void
{
    $logFile = VAR_FOLDER . DS . 'logs' . DS . 'sql.log';
    file_put_contents($logFile, $builder->toSql() . "\n", FILE_APPEND);
}

/**
 * Get elapsed time since php script first launched, or a custom start microtime
 *
 * @param start float: A custom start microtime
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
 * @param str string: The string to transform
 * @param capitalizeFirstLetter bool: Wether to capitalize the first letter or not
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
 * @param str string: The string to transform
 * @return string
 */
function slugify(string $str): string
{
    return preg_replace('/\s|\xc2\xa0/', '_', $str);
}

/**
 * Set all empty fields of an array to null
 *
 * @param data array: The array to clean
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

/**
 * Set all empty fields of an array to null
 *
 * @param e Illuminate\Database\QueryException: The PDO Exception thrown
 * @return bool
 */
function isDuplicateException(Illuminate\Database\QueryException $e): bool
{
    if ($e->getCode() != '23000') {
        return false;
    }

    $details = $e->getMessage();
    $subCode = explode(" ", explode(": ", $details)[2]);

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
 * @param string $directory dossier dans lequel placer le fichier (sera créé si inexistant)
 * @param UploadedFile $uploadedFile le fichier à placer
 * @return string le nom du fichier résultant
 */
function moveUploadedFile($directory, Slim\Http\UploadedFile $uploadedFile)
{
    $name = $uploadedFile->getClientFilename();

    $slugify = new Cocur\Slugify\Slugify(['lowercase' => false]);
    $nameSecure = $slugify->slugify($name);

    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    $uploadedFile->moveTo($directory . DS . $nameSecure);

    return $nameSecure;
}

function alphanumericalize(string $string): string
{
    return (new Cocur\Slugify\Slugify())
        ->slugify($string, ['separator' => '-']);
}

function buildResponse(int $status = 200): Response
{
    $headers = ['Content-Type' => 'text/html; charset=UTF-8'];

    $isCORSEnabled = Config::getSettings('enableCORS');
    if (!isTestMode() && $isCORSEnabled) {
        $headers = array_merge($headers, [
            'Access-Control-Allow-Origin'  => '*',
            'Access-Control-Allow-Headers' => 'X-Requested-With, Content-Type, Accept, Origin, Authorization',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
        ]);
    }

    return (new Response($status, new Headers($headers)))
        ->withProtocolVersion('1.1');
}
