<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Loxya\Controllers\Traits\Crud;

final class PersonController extends BaseController
{
    use Crud\GetAll;
}
