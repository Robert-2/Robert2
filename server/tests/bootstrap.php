<?php
declare(strict_types=1);

date_default_timezone_set('UTC');

require_once __DIR__ . '/../vendors/autoload.php';
require_once __DIR__ . '/constants.php';
require_once __DIR__ . '/../src/App/Config/constants.php';
require_once __DIR__ . '/../src/App/Config/functions.php';

use Loxya\Kernel;
use Loxya\Tests\Fixtures;

// - Chargement de l'environnement
$dotenv = Dotenv\Dotenv::createImmutable(ROOT_FOLDER, ['.env', '.env.test'], false);
$dotenv->safeLoad();

$echoError = function (string $msg): void {
    echo sprintf("\n\033[1;31m%s\033[0m\n\n", $msg);
    exit(1);
};

echo "\033[33m
 _
| |                             _            _
| |     _____  ___   _  __ _   | |_ ___  ___| |_ ___
| |    / _ \ \/ / | | |/ _` |  | __/ _ \/ __| __/ __|
| |___| (_) >  <| |_| | (_| |  | ||  __/\__ \ |_\__ \
\_____/\___/_/\_\\\__, |\__,_|   \__\___||___/\__|___/
                  __/ |
                 |___/

\033[0m";

try {
    Fixtures\Fixtures::resetTestDatabase();
} catch (PDOException $e) {
    $echoError(
        "Oops ! PDO returned the following error: "
        . $e->getMessage()
        . "\nTrace:\n\n"
        . $e->getTraceAsString()
    );
} catch (Exception $e) {
    $echoError("Oops ! Setting fixtures went wrong: " . $e->getMessage());
}

Kernel::boot();
