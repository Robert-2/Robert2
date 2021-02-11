<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Models\Document;
use Robert2\API\Errors;
use Robert2\API\Controllers\Traits\FileResponse;
use Slim\Http\Request;
use Slim\Http\Response;

class DocumentController
{
    use FileResponse;

    protected $container;
    protected $model;

    public function __construct($container)
    {
        $this->container = $container;
        $this->model = new Document();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Getters
    // —
    // ——————————————————————————————————————————————————————

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException;
        }

        $filePath = Document::getFilePath((int)$model->material_id, $model->name);
        debug($filePath, ['log' => true, 'append' => false]);

        $fileContent = file_get_contents($filePath);
        if (!$fileContent) {
            throw new Errors\NotFoundException("The file of the document cannot be found.");
        }

        return $this->_responseWithFile($response, $model->name, $fileContent);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $this->model->remove($id);
        return $response->withJson(['destroyed' => true], SUCCESS_OK);
    }
}
