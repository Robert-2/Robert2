<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Controllers\Traits\WithPdf;

class EstimateController extends BaseController
{
    use WithPdf;
    use Crud\SoftDelete;
}
