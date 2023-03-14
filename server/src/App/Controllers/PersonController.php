<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\Crud;

class PersonController extends BaseController
{
    use Crud\GetAll;
}
