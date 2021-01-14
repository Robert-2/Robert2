<?php

// - GLOBAL CONSTANTS, for use all over the application

// - Paths
if (!defined('DS')) {
    define('DS', DIRECTORY_SEPARATOR);
}
if (!defined('ROOT_FOLDER')) {
    define('ROOT_FOLDER', dirname(dirname(dirname(dirname(__FILE__)))));
}
if (!defined('SRC_FOLDER')) {
    define('SRC_FOLDER', ROOT_FOLDER . DS . 'src');
}
if (!defined('PUBLIC_FOLDER')) {
    define('PUBLIC_FOLDER', SRC_FOLDER . DS . 'public');
}
if (!defined('VAR_FOLDER')) {
    define('VAR_FOLDER', SRC_FOLDER . DS . 'var');
}
if (!defined('VIEWS_FOLDER')) {
    define('VIEWS_FOLDER', SRC_FOLDER . DS . 'views');
}

// - Errors codes
define('ERROR_VALIDATION', 400);
define('ERROR_UNAUTHORIZED', 401);
define('ERROR_NOT_FOUND', 404);
define('ERROR_NOT_ALLOWED', 405);
define('ERROR_DUPLICATE', 409);
define('ERROR_SERVER', 500);

// - Success codes
define('SUCCESS_OK', 200);
define('SUCCESS_CREATED', 201);
