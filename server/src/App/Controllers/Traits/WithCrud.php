<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

trait WithCrud
{
    use Crud\GetAll;
    use Crud\GetOne;
    use Crud\Create;
    use Crud\Update;
    use Crud\SoftDelete;
}
