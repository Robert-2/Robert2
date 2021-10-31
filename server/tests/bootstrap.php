<?php
declare(strict_types=1);

date_default_timezone_set('UTC');

require_once __DIR__ . '/../vendors/autoload.php';
require_once __DIR__ . '/constants.php';
require_once __DIR__ . '/../src/App/Config/constants.php';
require_once __DIR__ . '/../src/App/Config/functions.php';

use Robert2\Fixtures;

// - Chargement de l'environnement
$dotenv = Dotenv\Dotenv::createImmutable(ROOT_FOLDER);
$dotenv->safeLoad();

$echoError = function (string $msg) {
    echo sprintf("\n\033[1;31m%s\033[0m\n\n", $msg);
    exit(1);
};

echo "\033[33m
 ____       _               _   ____    _            _
|  _ \ ___ | |__   ___ _ __| |_|___ \  | |_ ___  ___| |_ ___
| |_) / _ \| '_ \ / _ \ '__| __| __) | | __/ _ \/ __| __/ __|
|  _ < (_) | |_) |  __/ |  | |_ / __/  | ||  __/\__ \ |_\__ \
|_| \_\___/|_.__/ \___|_|   \__|_____|  \__\___||___/\__|___/

\033[0m";

try {
    Fixtures\RobertFixtures::resetTestDatabase();
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
