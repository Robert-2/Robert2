<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Loxya\Controllers\Traits\Crud;

class EventTechnicianController extends BaseController
{
    use Crud\GetOne;
    use Crud\Create;
    use Crud\Update;
    use Crud\HardDelete;
}
