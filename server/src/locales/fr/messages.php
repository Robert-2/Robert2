<?php
declare(strict_types=1);

$common = include 'common.php';
$install = include 'install.php';
$validation = include 'validation.php';

return array_merge(
    $common,
    $install,
    $validation,
);
