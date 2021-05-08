<?php
use Robert2\API\App;

require '../vendor/autoload.php';
require '../App/Config/constants.php';
require '../App/Config/functions.php';

putenv('PHP_ROBERT2_TESTING=NORMAL');

// - Chargement de l'environnement
$dotenv = Dotenv\Dotenv::createImmutable(ROOT_FOLDER);
$dotenv->safeLoad();

// - Let's go !
$app = new App();
$app->add(new \Slim\HttpCache\Cache('private', 0));
$app->run();
