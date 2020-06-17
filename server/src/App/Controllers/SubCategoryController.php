<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\SubCategory;

class SubCategoryController extends BaseController
{
    public function __construct($container)
    {
        parent::__construct($container);

        $this->model = new SubCategory();
    }
}
