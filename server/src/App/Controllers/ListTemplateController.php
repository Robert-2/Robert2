<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Models\ListTemplate;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class ListTemplateController extends BaseController
{
    use WithCrud;

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $listTemplate = ListTemplate::findOrFail($id)->append(['materials']);
        return $response->withJson($listTemplate);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function create(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $postData['user_id'] = Auth::user()->id;

        $result = ListTemplate::new($postData);
        $listTemplate = $result->append(['materials']);

        return $response->withJson($listTemplate, SUCCESS_CREATED);
    }

    public function update(Request $request, Response $response): Response
    {
        $postData = (array)$request->getParsedBody();
        if (empty($postData)) {
            throw new \InvalidArgumentException(
                "Missing request data to process validation",
                ERROR_VALIDATION
            );
        }

        $id = (int)$request->getAttribute('id');
        $model = ListTemplate::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        $result = ListTemplate::staticEdit($id, $postData);
        $listTemplate = $result->append(['materials']);

        return $response->withJson($listTemplate, SUCCESS_OK);
    }
}
