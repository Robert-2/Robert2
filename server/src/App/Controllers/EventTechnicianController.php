<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\Crud;

class EventTechnicianController extends BaseController
{
    use Crud\GetOne;
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;
}
