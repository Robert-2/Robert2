<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Robert2\API\Controllers\Traits\WithModel;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

trait WithPdf
{
    use WithModel;
    use FileResponse;

    public function getOnePdf(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $model = $this->getModelClass()::findOrFail($id);

        if (!method_exists($model, 'getPdfName')) {
            throw new \RuntimeException("Model used for PDF must implement `getPdfName()` method.");
        }
        $fileName = $model->getPdfName($id);

        if (!method_exists($model, 'getPdfContent')) {
            throw new \RuntimeException("Model used for PDF must implement `getPdfContent()` method.");
        }
        $fileContent = $model->getPdfContent($id);

        return $this->_responseWithFile($response, $fileName, $fileContent);
    }
}
