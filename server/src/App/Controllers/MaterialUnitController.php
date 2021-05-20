<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Illuminate\Database\QueryException;
use Robert2\API\Controllers\Traits\FileResponse;
use Robert2\API\Controllers\Traits\WithCrud;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
use Robert2\API\Services\I18n;
use Robert2\Lib\Pdf\Pdf;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class MaterialUnitController extends BaseController
{
    use WithCrud;
    use FileResponse;

    /** @var I18n */
    private $i18n;

    /** @var array */
    private $settings;

    public function __construct(Container $container, I18n $i18n)
    {
        parent::__construct($container);

        $this->i18n = $i18n;
    }

    public function barCode(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $unit = MaterialUnit::with('Material')->findOrFail($id);

        $vars = [
            'name' => $unit->material['name'],
            'park' =>  $unit->park->name,
            'reference' => $unit->reference,
            'barcode' => $unit->barcode,
        ];
        $pdf = Pdf::createFromTemplate('barcode', $vars);

        $fileName = sprintf(
            '%s-%s-%s.pdf',
            $this->i18n->translate('label'),
            slugify($unit->material['name']),
            slugify($unit->reference)
        );
        return $this->_responseWithFile($response, $fileName, $pdf);
    }

    // ------------------------------------------------------
    // -
    // -    Api Actions
    // -
    // ------------------------------------------------------

    public function getOne(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $unit = MaterialUnit::find($id);
        if (!$unit) {
            throw new HttpNotFoundException($request);
        }

        $data = $unit->append('material')->toArray();
        return $response->withJson($data);
    }

    public function create(Request $request, Response $response): Response
    {
        $data = (array)$request->getParsedBody();
        if (empty($data)) {
            throw new \InvalidArgumentException(
                "Aucun donnée n'a été fournie.",
                ERROR_VALIDATION
            );
        }

        $materialId = (int)$request->getAttribute('materialId');
        if (!$materialId) {
            throw new HttpNotFoundException($request);
        }

        $material = Material::find($materialId);
        if (!$material || !$material->is_unitary) {
            throw new HttpNotFoundException($request);
        }

        $unit = new MaterialUnit(cleanEmptyFields($data));
        $unit->validate();

        try {
            $material->Units()->save($unit);
        } catch (QueryException $e) {
            throw (new ValidationException)
                ->setPDOValidationException($e);
        }

        return $response->withJson($unit->refresh(), SUCCESS_CREATED);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        MaterialUnit::staticRemove($id);

        return $response->withJson([], SUCCESS_OK);
    }
}
