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

        return $this->_responseWithPdf($response, $fileName);
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _responseWithPdf(Response $response, string $fileName): Response
    {
        $filePath = DATA_FOLDER . DS . $this->dataFolder . DS . $fileName;
        if (!file_exists($filePath)) {
            throw new Errors\NotFoundException(sprintf("PDF file %s not found.", $fileName));
        }

        try {
            $streamHandle = fopen($filePath, 'r');
            $pdfStream = new Stream($streamHandle);

            return $response
                ->withHeader('Content-Type', 'application/force-download')
                ->withHeader('Content-Type', 'application/octet-stream')
                ->withHeader('Content-Type', 'application/download')
                ->withHeader('Content-Description', 'File Transfer')
                ->withHeader('Content-Transfer-Encoding', 'binary')
                ->withHeader('Content-Disposition', sprintf('attachment; filename="%s"', basename($filePath)))
                ->withHeader('Expires', '0')
                ->withHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->withHeader('Pragma', 'public')
                ->withHeader('Content-Length', filesize($filePath))
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
