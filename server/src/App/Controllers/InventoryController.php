<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Robert2\API\Controllers\Traits\WithPdf;
use Robert2\API\Models\Inventory;
use Robert2\API\Models\Park;
use Robert2\API\Services\Auth;
use Slim\Exception\HttpException;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class InventoryController extends BaseController
{
    use WithPdf;

    // ------------------------------------------------------
    // -
    // -    Api Actions
    // -
    // ------------------------------------------------------

    public function getParkOne(Request $request, Response $response): Response
    {
        $parkId = (int)$request->getAttribute('parkId');

        /** @var Park */
        $park = Park::findOrFail($parkId);

        switch ($request->getAttribute('id')) {
            case 'latest':
                $inventory = $park->getLatestInventory();
                break;

            case 'ongoing':
                $inventory = $park->getOngoingInventory();
                break;

            default:
                $inventory = null;
        }

        if ($inventory === null) {
            throw new HttpNotFoundException($request);
        }

        return $response->withJson($inventory);
    }

    public function getParkAll(Request $request, Response $response): Response
    {
        $parkId = (int)$request->getAttribute('parkId');
        if (!Park::staticExists($parkId)) {
            throw new HttpNotFoundException($request);
        }

        $inventories = Inventory::where('park_id', $parkId)
            ->with('author')
            ->orderBy('created_at', 'desc')
            ->get();

        return $response->withJson($inventories);
    }

    public function create(Request $request, Response $response): Response
    {
        $parkId = (int)$request->getAttribute('parkId');
        $force = (bool)$request->getQueryParam('force', false);
        $park = Park::findOrFail($parkId);

        // - Si un inventaire est déjà en cours.
        $ongoingInventory = $park->getOngoingInventory();
        if ($ongoingInventory !== null) {
            if ($ongoingInventory->author_id !== Auth::user()->id) {
                $canForceAcquire = (
                    $ongoingInventory->author_id === null ||
                    Auth::user()->group_id === 'admin'
                );
                if (!$force || !$canForceAcquire) {
                    throw new HttpException($request, 'Locked.', 423);
                }

                // - Acquisition forcée.
                $ongoingInventory->author_id = Auth::user()->id;
                $ongoingInventory->save();
            }
            return $response->withJson($ongoingInventory);
        }

        $inventory = new Inventory([
            'park_id' => $parkId,
            'author_id' => Auth::user()->id,
            'is_tmp' => true,
        ]);

        // - On valide et persiste l'inventaire en db.
        $inventory->validate()->save();
        $inventory->refresh();

        return $response->withJson($inventory, SUCCESS_OK);
    }

    public function patch(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $inventory = Inventory::findOrFail($id)->append('materials');

        $data = (array)$request->getParsedBody();
        // phpcs:ignore PSR2.ControlStructures.ControlStructureSpacing
        if (
            !array_key_exists('materialId', $data) ||
            !array_key_exists('quantities', $data) ||
            !is_array($data['quantities'])
        ) {
            throw new \InvalidArgumentException("Données invalides.");
        }

        $inventoryMaterial = $inventory->saveMaterialQuantities($data['materialId'], $data['quantities']);
        return $response->withJson($inventoryMaterial, SUCCESS_OK);
    }

    public function update(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $inventory = Inventory::findOrFail($id)->append('materials');

        $quantities = (array)$request->getParsedBody();
        if (!is_array($quantities)) {
            throw new \InvalidArgumentException("La liste des quantités est invalide.");
        }

        $inventory->updateQuantities($quantities);
        return $response->withJson($inventory, SUCCESS_OK);
    }

    public function terminate(Request $request, Response $response): Response
    {
        $id = (int)$request->getAttribute('id');
        $inventory = Inventory::findOrFail($id)->append('materials');

        $quantities = (array)$request->getParsedBody();
        if (!is_array($quantities)) {
            throw new \InvalidArgumentException("La liste des quantités est invalide.");
        }

        $inventory->updateQuantities($quantities)->terminate();
        return $response->withJson($inventory, SUCCESS_OK);
    }
}
