<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\Person;
use Robert2\API\Controllers\Traits\Taggable;

class PersonController extends BaseController
{
    use Taggable;

    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new Person();
    }
}
