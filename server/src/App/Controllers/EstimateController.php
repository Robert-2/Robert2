<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Loxya\Controllers\Traits\Crud;
use Loxya\Http\Request;
use Loxya\Models\Estimate;
use Loxya\Services\Auth;
use Loxya\Services\I18n;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class EstimateController extends BaseController
{
    use Crud\SoftDelete;

    private I18n $i18n;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    public function getOnePdf(Request $request, Response $response): ResponseInterface
    {
        $id = $request->getIntegerAttribute('id');
        $estimate = Estimate::findOrFailForUser($id, Auth::user());

        return $estimate
            ->toPdf($this->i18n)
            ->asResponse($response);
    }
}
