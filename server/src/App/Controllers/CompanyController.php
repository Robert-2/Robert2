<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\Company;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class CompanyController extends BaseController
{
    use WithCrud;

    public function getPersons(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $company = Company::find($id);
        if (!$company) {
            throw new HttpNotFoundException($request);
        }

        $results = $this->paginate($request, $company->Persons());
        return $response->withJson($results);
    }
}
