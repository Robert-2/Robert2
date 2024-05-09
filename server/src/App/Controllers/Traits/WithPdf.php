<?php
declare(strict_types=1);

namespace Loxya\Controllers\Traits;

use Loxya\Http\Request;
use Loxya\Support\Pdf;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

trait WithPdf
{
    use WithModel;

    public function getOnePdf(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $model = $this->getModelClass()::findOrFail($id);

        if (!method_exists($model, 'toPdf')) {
            throw new \LogicException("Model used for PDF must implement `toPdf()` method.");
        }

        $pdf = $model->toPdf($this->container->get('i18n'));
        if (!($pdf instanceof Pdf)) {
            throw new \LogicException("Model's `toPdf()` method should return an instance of `Pdf`.");
        }

        return $pdf->asResponse($response);
    }
}
