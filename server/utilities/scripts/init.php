<?php // phpcs:disable
// -----------------------------------------------------------
// -
// - This file must be required by all scripts in this folder!
// -
// -----------------------------------------------------------
// phpcs:enable

if (!defined('DS')) {
    define('DS', DIRECTORY_SEPARATOR);
}

define('SCRIPTS_FOLDER', __DIR__);
define('ROOT_FOLDER', dirname(dirname(SCRIPTS_FOLDER)));
define('DATA_FOLDER', ROOT_FOLDER . DS . 'data');
define('SRC_FOLDER', ROOT_FOLDER . DS . 'src');

require SRC_FOLDER . DS . 'vendor' . DS . 'autoload.php';
require SRC_FOLDER . DS . 'App' . DS . 'Config' . DS . 'constants.php';
require SRC_FOLDER . DS . 'App' . DS . 'Config' . DS . 'functions.php';
