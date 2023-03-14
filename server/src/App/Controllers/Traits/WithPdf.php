<?php
declare(strict_types=1);

namespace Robert2\API\Controllers\Traits;

use Robert2\API\Http\Request;
use Robert2\Support\Pdf;
use Slim\Http\Response;

trait WithPdf
{
    use WithModel;

    public function getOnePdf(Request $request, Response $response): Response
    {
        $id = (int) $request->getAttribute('id');
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
