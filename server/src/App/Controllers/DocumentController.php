<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\API\Models\Document;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class DocumentController extends BaseController
{
    use FileResponse;

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = Document::find($id);
        if (!$model) {
            throw new HttpNotFoundException($request);
        }

        $fileContent = file_get_contents($model->file_path);
        if (!$fileContent) {
            throw new HttpNotFoundException($request, "The file of the document cannot be found.");
        }

        return $this->_responseWithFile($response, $model->name, $fileContent);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        Document::staticRemove($id);

        return $response->withJson(['destroyed' => true], SUCCESS_OK);
    }
}
