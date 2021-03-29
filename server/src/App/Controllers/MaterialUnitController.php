<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Illuminate\Database\QueryException;
use Robert2\API\Errors;
use Robert2\API\Models\Material;
use Robert2\API\Models\MaterialUnit;
use Robert2\API\Controllers\Traits\FileResponse;
use Slim\Http\Request;
use Slim\Http\Response;
use Robert2\Lib\Pdf\Pdf;
use Robert2\API\I18n\I18n;

class MaterialUnitController extends BaseController
{
    use FileResponse;

    /** @var MaterialUnit */
    protected $model;

    public function barCode(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');

        $unit = $this->model->with('Material')->find($id);
        if (!$unit) {
            throw new Errors\NotFoundException;
        }

        $vars = [
            'name' => $unit->material['name'],
            'park' =>  $unit->park->name,
            'serialNumber' => $unit->serial_number,
            'barcode' => $unit->barcode,
        ];
        $pdf = Pdf::createFromTemplate('barcode', $vars);

        $fileName = sprintf(
            '%s-%s-%s.pdf',
            (new I18n())->translate('label'),
            slugify($unit->material['name']),
            slugify($unit->serial_number)
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

        $unit = $this->model->find($id);
        if (!$unit) {
            throw new Errors\NotFoundException;
        }

        $data = $unit->append('material')->toArray();
        return $response->withJson($data);
    }

    public function create(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        if (empty($data)) {
            throw new \InvalidArgumentException(
                "Aucun donnée n'a été fournie.",
                ERROR_VALIDATION
            );
        }

        $materialId = (int)$request->getAttribute('materialId');
        if (!$materialId) {
            throw new Errors\NotFoundException;
        }

        $material = Material::find($materialId);
        if (!$material || !$material->is_unitary) {
            throw new Errors\NotFoundException;
        }

        $unit = new MaterialUnit(cleanEmptyFields($data));
        $unit->validate();

        try {
            $material->Units()->save($unit);
        } catch (QueryException $e) {
            $error = new Errors\ValidationException();
            $error->setPDOValidationException($e);
            throw $error;
        }

        return $response->withJson($unit->refresh(), SUCCESS_CREATED);
    }

    public function delete(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $this->model->remove($id);

        return $response->withJson([], SUCCESS_OK);
    }
}
