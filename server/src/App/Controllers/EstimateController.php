<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Loxya\Controllers\Traits\Crud;
use Loxya\Controllers\Traits\WithPdf;

class EstimateController extends BaseController
{
    use WithPdf;
    use Crud\SoftDelete;
}
