<?php
declare(strict_types=1);

// - Make errors more obvious during testing
error_reporting(-1);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
date_default_timezone_set('UTC');

putenv('PHP_ROBERT2_TESTING=TESTS');

require_once 'src/vendor/autoload.php';
require_once 'tests/constants.php';
require_once 'src/App/Config/constants.php';
require_once 'src/App/Config/functions.php';

use Robert2\Fixtures;

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
