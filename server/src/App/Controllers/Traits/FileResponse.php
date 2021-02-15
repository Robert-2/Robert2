<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Slim\Http\Response;
use Slim\Http\Stream;

trait FileResponse
{
    protected function _responseWithFile(Response $response, string $fileName, string $fileContent): Response
    {
        try {
            $streamHandle = fopen('php://memory', 'r+');
            fwrite($streamHandle, $fileContent);
            rewind($streamHandle);
            $fileStream = new Stream($streamHandle);

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
                ->withHeader('Content-Length', $fileStream->getSize())
                ->withBody($fileStream);
        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf(
                "Cannot send the file « %s ». Details: %s",
                $fileName,
                $e->getMessage()
            ));
        }
    }
}
