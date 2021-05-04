<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\Taggable;
use Robert2\API\Controllers\Traits\WithCrud;

class PersonController extends BaseController
{
    use WithCrud, Taggable {
        Taggable::getAll insteadof WithCrud;
    }
}
