<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Controllers\Traits\Crud;
use Loxya\Http\Request;
use Loxya\Models\Document;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Psr7\Stream;

class DocumentController extends BaseController
{
    use Crud\HardDelete;

    public function getFile(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
        $document = Document::findOrFail($id);

        $fileName = $document->name;
        $fileContent = file_get_contents($document->path);
        if (!$fileContent) {
            throw new HttpNotFoundException($request, "The file of the document cannot be found.");
        }

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
                ->withStatus(StatusCode::STATUS_OK)
                ->withBody($fileStream);
        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf(
                "Cannot send the file \"%s\". Details: %s",
                $fileName,
                $e->getMessage()
            ));
        }
    }
}
