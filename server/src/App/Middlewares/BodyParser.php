<?php
declare(strict_types=1);

namespace Robert2\API\Middlewares;

use Adbar\Dot as DotArray;
use Notihnio\MultipartFormDataParser\MultipartFormDataParser;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Robert2\Lib\Filesystem\UploadedFile;
use Slim\Middleware\BodyParsingMiddleware as BodyParsingMiddlewareCore;

class BodyParser extends BodyParsingMiddlewareCore
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $parsedBody = $request->getParsedBody();
        if ($parsedBody === null || empty($parsedBody)) {
            $parsedBody = $this->parseBody($request);
            $request = $request->withParsedBody($parsedBody);
        }

        $mediaType = $this->getMediaType($request);
        if ($mediaType === 'multipart/form-data') {
            // - Ajout le parsing aussi pour les méthodes PUT, PATCH, DELETE.
            $parsedRequest = MultipartFormDataParser::parse($request);
            $request = $request->withParsedBody($parsedRequest->params);
            $request = $request->withUploadedFiles(
                static::normalizeUploadedFiles($parsedRequest->files)
            );

            // - Gestion des envois hybrides avec données sous forme de JSON et fichiers uploadés.
            $parsedBody = $request->getParsedBody();
            if (is_array($parsedBody) && array_key_exists('@data', $parsedBody)) {
                $data = json_decode($parsedBody['@data'], true);
                $data = new DotArray(is_array($data) ? $data : []);
                unset($parsedBody['@data']);

                $rawUploadedFiles = $request->getUploadedFiles();
                if (!empty($rawUploadedFiles)) {
                    $uploadedFiles = new DotArray;
                    foreach ($rawUploadedFiles as $name => $file) {
                        $name = base64_decode($name);
                        if ($name === false) {
                            continue;
                        }

                        // @see https://regex101.com/r/eUq52B/1
                        $name = preg_replace('/\[([0-9]+)\]/', '.$1', $name);

                        $data->add($name, $file);
                        $uploadedFiles->add($name, $file);
                    }
                    $request = $request->withUploadedFiles($uploadedFiles->all());
                }

                $parsedBody = array_replace($data->all(), $parsedBody);
                $request = $request->withParsedBody($parsedBody);
            }
        }

        return $handler->handle($request);
    }

    private static function normalizeUploadedFiles(array $files): array
    {
        $normalized = [];
        foreach ($files as $key => $value) {
            if (!is_array($value)) {
                continue;
            }

            $normalized[$key] = !isset($value['tmp_name'])
                ? static::normalizeUploadedFiles($value)
                : new UploadedFile(
                    $value['tmp_name'],
                    (int) $value['size'],
                    (int) $value['error'],
                    $value['name'],
                    $value['type']
                );
        }
        return $normalized;
    }
}
