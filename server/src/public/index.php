<?php
declare(strict_types=1);

use Loxya\App;

require __DIR__ . '/../../vendors/autoload.php';
require __DIR__ . '/../App/Config/constants.php';
require __DIR__ . '/../App/Config/functions.php';

// - Chargement de l'environnement.
$dotenv = Dotenv\Dotenv::createImmutable(ROOT_FOLDER);
$dotenv->safeLoad();

// - Let's go !
$app = new App();
$app->add(new \Slim\HttpCache\Cache('private', 0));
$app->run();
