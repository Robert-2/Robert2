<?php
declare(strict_types=1);

namespace Loxya\Support;

use Dompdf\Dompdf;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Config\Config;
use Loxya\Services\I18n;
use Loxya\Services\View;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;
use Slim\Psr7\Stream;

final class Pdf
{
    protected string $name;

    protected string $html;

    protected ?string $content = null;

    public function __construct(string $name, string $html)
    {
        $name = Str::slugify(preg_replace('/\.pdf$/i', '', $name));
        $this->name = sprintf('%s.pdf', $name);

        $this->html = $html;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getRawContent(): string
    {
        return $this->html;
    }

    public function getContent(): string
    {
        if ($this->content !== null) {
            return $this->content;
        }

        // - Font cache dir
        $cacheDir = CACHE_FOLDER . DS . 'pdf';
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0777, true);
        }

        $renderer = new Dompdf([
            'tempDir' => TMP_FOLDER,
            'fontCache' => $cacheDir,
            'logOutputFile' => LOGS_FOLDER . DS . 'pdf.html',
            'defaultMediaType' => 'print',
            'defaultPaperSize' => 'a4',
            'defaultPaperOrientation' => 'portrait',
            'defaultFont' => 'DejaVu Sans',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $renderer->loadHtml($this->getRawContent());
        $renderer->render();

        $this->content = $renderer->output();
        if ($this->content === null) {
            throw new \RuntimeException('An unknown error occurred while rendering the PDF.');
        }

        return $this->content;
    }

    // ------------------------------------------------------
    // -
    // -    Factory methods
    // -
    // ------------------------------------------------------

    public static function createFromTemplate(string $template, I18n $i18n, string $name, array $data): static
    {
        $html = (new View($i18n, 'pdf'))->fetch($template, array_merge($data, [
            'baseUrl' => Config::getBaseUrl(),
        ]));
        return new static($name, $html);
    }

    // ------------------------------------------------------
    // -
    // -    Output methods
    // -
    // ------------------------------------------------------

    public function asResponse(Response $response): ResponseInterface
    {
        if (env('DEBUG_PDF') === true && Config::getEnv() !== 'test') {
            return $this->asResponseHtml($response);
        }

        $content = $this->getContent();
        if (Config::getEnv() === 'test') {
            $content = $this->getRawContent();
        }

        try {
            $streamHandle = fopen('php://memory', 'r+');
            fwrite($streamHandle, $content);
            rewind($streamHandle);
            $fileStream = new Stream($streamHandle);

            return $response
                ->withHeader('Content-Type', 'application/force-download')
                ->withHeader('Content-Type', 'application/octet-stream')
                ->withHeader('Content-Type', 'application/download')
                ->withHeader('Content-Description', 'File Transfer')
                ->withHeader('Content-Transfer-Encoding', 'binary')
                ->withHeader('Content-Disposition', sprintf('attachment; filename="%s"', $this->getName()))
                ->withHeader('Expires', '0')
                ->withHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->withHeader('Pragma', 'public')
                ->withHeader('Content-Length', $fileStream->getSize())
                ->withStatus(StatusCode::STATUS_OK)
                ->withBody($fileStream);
        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf(
                "Cannot send the file \"%s\". Details: %s",
                $this->getName(),
                $e->getMessage()
            ));
        }
    }

    public function asResponseHtml(Response $response): ResponseInterface
    {
        $content = $this->getRawContent();
        $response->getBody()->write($content);
        return $response;
    }
}
