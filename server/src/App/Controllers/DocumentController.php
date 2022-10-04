<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\Crud;
use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\API\Models\Document;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class DocumentController extends BaseController
{
    use Crud\HardDelete;
    use FileResponse;

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $document = Document::findOrFail($id);

        $fileContent = file_get_contents($document->file_path);
        if (!$fileContent) {
            throw new HttpNotFoundException($request, "The file of the document cannot be found.");
        }

        return $this->_responseWithFile($response, $document->name, $fileContent);
    }
}
