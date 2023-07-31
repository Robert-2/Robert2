<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Loxya\Controllers\Traits\Crud;

class PersonController extends BaseController
{
    use Crud\GetAll;
}
