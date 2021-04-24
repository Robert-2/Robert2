<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Slim\Http\Request;
use Slim\Http\Response;
use Robert2\API\Errors;

trait WithPdf
{
    use FileResponse;

    public function getOnePdf(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->model->find($id);
        if (!$model) {
            throw new Errors\NotFoundException();
        }

        if (!method_exists($this->model, 'getPdfName')) {
            throw new \RuntimeException("Model used for PDF must implement getPdfName() method.");
        }
        $fileName = $this->model->getPdfName($id);

        if (!method_exists($this->model, 'getPdfContent')) {
            throw new \RuntimeException("Model used for PDF must implement getPdfContent() method.");
        }
        $fileContent = $this->model->getPdfContent($id);

        return $this->_responseWithFile($response, $fileName, $fileContent);
    }
}
