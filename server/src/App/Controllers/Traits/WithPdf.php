<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

use Robert2\API\Errors;

trait WithPdf
{
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

        return $this->_responseWithPdf($response, $fileName, $fileContent);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _responseWithPdf(Response $response, string $fileName, string $fileContent): Response
    {
        try {
            $streamHandle = fopen('php://memory', 'r+');
            fwrite($streamHandle, $fileContent);
            rewind($streamHandle);
            $pdfStream = new Stream($streamHandle);

            return $response
                ->withHeader('Content-Type', 'application/force-download')
                ->withHeader('Content-Type', 'application/octet-stream')
                ->withHeader('Content-Type', 'application/download')
                ->withHeader('Content-Description', 'File Transfer')
                ->withHeader('Content-Transfer-Encoding', 'binary')
                ->withHeader('Content-Disposition', sprintf('attachment; filename="%s"', $fileName))
                ->withHeader('Expires', '0')
                ->withHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->withHeader('Pragma', 'public')
                ->withHeader('Content-Length', $pdfStream->getSize())
                ->withBody($pdfStream);
        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf(
                "Cannot send PDF file « %s ». Details: %s",
                $fileName,
                $e->getMessage()
            ));
        }
    }
}
