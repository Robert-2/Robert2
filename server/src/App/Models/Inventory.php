<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Traits\WithPdf;
use Robert2\API\Services\I18n;
use Robert2\API\Validation\Validator as V;

class Inventory extends BaseModel
{
    use WithPdf;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->pdfTemplate = 'inventory-default';

        $this->validation = [
            'date' => V::callback([$this, 'checkDate']),
            'park_id' => V::notEmpty()->numeric(),
            'is_tmp' => V::callback([$this, 'checkIsTmp']),
            'author_id' => V::notEmpty()->numeric(),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Validation
    // -
    // ------------------------------------------------------

    public function checkDate()
    {
        if ($this->is_tmp) {
            return V::nullType();
        }
        return V::notEmpty()->datetime();
    }

    public function checkIsTmp($value)
    {
        $isValid = V::notOptional()->boolType()->validate($value);
        if (!$isValid) {
            return false;
        }

        if (!$this->park_id || !$value) {
            return true;
        }

        // - Si c'est un inventaire temporaire, on vérifie qu'il n'y en a pas
        //   d'autre déjà en cours pour le même parc.
        return static::where('park_id', $this->park_id)
            ->where('is_tmp', true)
            ->where(function ($query) {
                if ($this->id) {
                    return;
                }
                $query->where('id', '<>', $this->id);
            })
            ->count() === 0;
    }

    // ------------------------------------------------------
    // -
    // -    Relations
    // -
    // ------------------------------------------------------

    public function Park()
    {
        return $this->belongsTo(Park::class);
    }

    public function Author()
    {
        return $this->belongsTo(User::class, 'author_id')
            ->select(['users.id', 'pseudo', 'email', 'group_id']);
    }

    public function Materials()
    {
        return $this->hasMany(InventoryMaterial::class);
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'date' => 'datetime',
        'park_id' => 'integer',
        'author_id' => 'integer',
        'is_tmp' => 'boolean',
    ];

    public function getMaterialsAttribute()
    {
        return $this->Materials()->get();
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = [
        'date',
        'park_id',
        'author_id',
        'is_tmp',
    ];

    // ------------------------------------------------------
    // -
    // -    Public Methods
    // -
    // ------------------------------------------------------

    public function updateQuantities($rawQuantities): self
    {
        if (!$this->exists || !$this->id) {
            throw new \LogicException("Les quantitiés ne peuvent être mise à jour que pour un inventaire existant.");
        }

        if (!$this->is_tmp) {
            throw new \LogicException("Les quantitiés d'un inventaire terminé ne peuvent pas être mise à jour.");
        }

        $allInventoryMaterials = $this->Materials()->get();
        $savedInventoryMaterials = array_column(
            array_filter(
                $allInventoryMaterials->all(),
                function ($savedMaterial) {
                    // - Si le matériel a été supprimé entre temps, on ne le garde pas.
                    return $savedMaterial->material_id !== null;
                }
            ),
            null,
            'material_id'
        );

        $data = [];
        $errors = [];
        $availableUnitStates = MaterialUnitState::pluck('id')->toArray();
        foreach ($rawQuantities as $quantity) {
            if (!array_key_exists('id', $quantity)) {
                continue;
            }

            $material = Material::find($quantity['id']);
            if (!$material) {
                continue;
            }

            if (!$material->is_unitary && $material->park_id !== $this->park_id) {
                continue;
            }

            $savedInventoryMaterial = array_key_exists($quantity['id'], $savedInventoryMaterials)
                ? $savedInventoryMaterials[$quantity['id']]
                : null;

            if ($savedInventoryMaterial && $material->is_unitary !== $savedInventoryMaterial->is_unitary) {
                $savedInventoryMaterial->delete();
                $savedInventoryMaterial = null;
            }

            if (!array_key_exists('actual', $quantity) || !is_integer($quantity['actual'])) {
                $errors[] = ['id' => $material->id, 'message' => "Quantité effective invalide."];
                continue;
            }
            $actual = (int)$quantity['actual'];

            if (!array_key_exists('broken', $quantity) || !is_integer($quantity['broken'])) {
                $errors[] = ['id' => $material->id, 'message' => "Quantité en panne invalide."];
                continue;
            }
            $broken = (int)$quantity['broken'];

            if ($actual < 0 || $broken < 0) {
                $errors[] = [
                    'id' => $material->id,
                    'message' => "Les quantités ne peuvent pas être négatives."
                ];
                continue;
            }

            if ($broken > $actual) {
                $errors[] = [
                    'id' => $material->id,
                    'message' => "La quantité en panne ne peut pas être supérieure à la quantité totale."
                ];
                continue;
            }

            $units = [];
            if ($material->is_unitary) {
                if (!array_key_exists('units', $quantity) || !is_array($quantity['units'])) {
                    continue;
                }

                $availableUnits =  array_column(
                    array_filter(
                        $material->units,
                        function ($unit) {
                            return $unit['park_id'] === $this->park_id;
                        }
                    ),
                    null,
                    'id'
                );

                $savedInventoryUnits = [];
                if ($savedInventoryMaterial) {
                    $savedInventoryUnits = array_column(
                        array_filter(
                            $savedInventoryMaterial->units->all(),
                            function ($savedUnit) {
                                // - Si l'unité a été supprimé entre temps, on ne le garde pas.
                                return $savedUnit->material_unit_id !== null;
                            }
                        ),
                        null,
                        'material_unit_id'
                    );
                }

                foreach ($quantity['units'] as $unitQuantity) {
                    // phpcs:ignore PSR2.ControlStructures.ControlStructureSpacing
                    if (
                        !array_key_exists('id', $unitQuantity) ||
                        !array_key_exists($unitQuantity['id'], $availableUnits)
                    ) {
                        continue;
                    }
                    $unit = $availableUnits[$unitQuantity['id']];

                    $savedUnit = array_key_exists($unitQuantity['id'], $savedInventoryUnits)
                        ? $savedInventoryUnits[$unitQuantity['id']]
                        : null;

                    $defaults = ['isLost' => true, 'isBroken' => false, 'state' => $unit['state']];
                    $unitQuantity = array_replace($defaults, $unitQuantity);
                    if ($unitQuantity['isLost'] && $unitQuantity['isBroken']) {
                        $errors[] = [
                            'id' => $material->id,
                            'message' => "Les unités ne peuvent pas être \"en panne\" et \"perdues\" au même moment."
                        ];
                        continue 2;
                    }

                    if (!in_array($unitQuantity['state'], $availableUnitStates, true)) {
                        $errors[] = [
                            'id' => $material->id,
                            'message' => "Certains états d'unité sont invalides."
                        ];
                        continue 2;
                    }

                    $isNew = false;
                    if ($this->created_at && $unit['created_at']) {
                        $isNew = $this->created_at->isBefore($unit['created_at']);
                    }

                    $units[] = ($savedUnit ?? new InventoryMaterialUnit)->fill([
                        'material_unit_id' => $unit['id'],
                        'reference' => $unit['reference'],
                        'is_new' => $isNew,
                        'is_lost_previous' => null,
                        'is_lost_current' => (bool)$unitQuantity['isLost'],
                        'is_broken_previous' => null,
                        'is_broken_current' => (bool)$unitQuantity['isBroken'],
                        'state_previous' => null,
                        'state_current' => $unitQuantity['state'],
                    ]);
                }

                $actual = null;
                $broken = null;
            }

            $isNew = false;
            if ($this->created_at && $material->created_at) {
                $isNew = $this->created_at->isBefore($material->created_at);
            }

            $inventoryMaterial = ($savedInventoryMaterial ?? new InventoryMaterial)->fill([
                'material_id' => $material->id,
                'reference' => $material->reference,
                'name' => $material->name,
                'is_unitary' => $material->is_unitary,
                'is_new' => $isNew,
                'stock_quantity_previous' => null,
                'stock_quantity_current' => $actual,
                'out_of_order_quantity_previous' => null,
                'out_of_order_quantity_current' => $broken,
            ]);

            $data[] = [
                'material' => $inventoryMaterial,
                'units' => $units,
                'outdatedUnits' => $savedInventoryMaterial
                    ? $savedInventoryMaterial->units->diff($units)
                    : [],
            ];
        }

        if (!empty($errors)) {
            throw (new ValidationException)
                ->setValidationErrors($errors);
        }

        $outdatedMaterials = $allInventoryMaterials->diff(array_column($data, 'material'));
        InventoryMaterial::destroy($outdatedMaterials);

        foreach ($data as $currentData) {
            $material = $currentData['material'];
            $this->Materials()->save($material);

            if ($material->is_unitary) {
                InventoryMaterialUnit::destroy($currentData['outdatedUnits']);
                $material->Units()->saveMany($currentData['units']);
            } else {
                $material->Units()->delete();
            }
        }

        return $this;
    }

    public function terminate()
    {
        if (!$this->exists || !$this->id) {
            throw new \LogicException("Seuls les inventaires existants peuvent être marqués comme \"Terminés\".");
        }

        if (!$this->is_tmp) {
            throw new \LogicException("L'inventaire est déjà marqué comme terminé.");
        }

        $allInventoryMaterials = $this->Materials()->get();
        $savedInventoryMaterials = array_column(
            array_filter(
                $allInventoryMaterials->all(),
                function ($savedMaterial) {
                    // - Si le matériel a été supprimé entre temps, on ne le garde pas.
                    return $savedMaterial->material_id !== null;
                }
            ),
            null,
            'material_id'
        );

        $data = [];
        $errors = [];
        $allMaterials = Material::getParkAll($this->park_id);
        foreach ($allMaterials as $material) {
            if (!array_key_exists($material['id'], $savedInventoryMaterials)) {
                $errors[] = [
                    'id' => $material['id'],
                    'message' => "Ce matériel n'était pas présent dans l'inventaire soumis."
                ];
                continue;
            }
            $inventoryMaterial = $savedInventoryMaterials[$material['id']];

            $isUnitary = $material['is_unitary'];
            if ($inventoryMaterial->is_unitary !== $material['is_unitary']) {
                // - On supprime l'enregisstrement car il est obsolète.
                $inventoryMaterial->delete();

                $errors[] = [
                    'id' => $material['id'],
                    'message' => "La gestion des unités du matériel a changée, veuillez vérifier ses quantités."
                ];
                continue;
            }

            // - Quantités précédentes.
            $previousStockQuantity = !$isUnitary ? (int)$material['stock_quantity'] : null;
            $previousOutOfOrderQuantity = !$isUnitary ? (int)$material['out_of_order_quantity'] : null;
            if ($inventoryMaterial->is_new) {
                $previousStockQuantity = null;
                $previousOutOfOrderQuantity = null;
            }

            $units = [];
            if ($isUnitary) {
                $savedInventoryUnits = array_column(
                    array_filter(
                        $inventoryMaterial->units->all(),
                        function ($savedUnit) {
                            // - Si l'unité a été supprimé entre temps, on ne le garde pas.
                            return $savedUnit->material_unit_id !== null;
                        }
                    ),
                    null,
                    'material_unit_id'
                );

                foreach ($material['units'] as $unit) {
                    if (!array_key_exists($unit['id'], $savedInventoryUnits)) {
                        $errors[] = [
                            'id' => $material['id'],
                            'message' => "Les unités matériel ont été mises à jour depuis la soumission."
                        ];
                        continue 2;
                    }

                    $savedUnit = $savedInventoryUnits[$unit['id']];
                    $savedUnit->fill([
                        'reference' => $unit['reference'],
                        'is_lost_previous' => !$savedUnit->is_new ? $unit['is_lost'] : null,
                        'is_broken_previous' => !$savedUnit->is_new ? $unit['is_broken'] : null,
                        'state_previous' => !$savedUnit->is_new ? $unit['state'] : null,
                    ]);

                    $units[] = $savedUnit;
                }
            }

            $inventoryMaterial->fill([
                'reference' => $material['reference'],
                'name' => $material['name'],
                'stock_quantity_previous' => $previousStockQuantity,
                'out_of_order_quantity_previous' => $previousOutOfOrderQuantity,
            ]);

            $data[] = [
                'material' => $inventoryMaterial,
                'units' => $units,
                'outdatedUnits' => $inventoryMaterial->units->diff($units),
            ];
        }

        if (!empty($errors)) {
            throw (new ValidationException)
                ->setValidationErrors($errors);
        }

        // TODO: Wrapper ça dans une transaction en debuggant l'erreur PDO "There is no active transaction" ...

        $outdatedMaterials = $allInventoryMaterials->diff(array_column($data, 'material'));
        InventoryMaterial::destroy($outdatedMaterials);

        foreach ($data as $currentData) {
            $inventoryMaterial = $currentData['material'];
            $inventoryMaterial->save();

            // - Met à jour les quantités du matériel.
            $originalMaterial = $inventoryMaterial->Material()->first();
            $originalMaterial->update([
                'stock_quantity' => !$inventoryMaterial->is_unitary
                    ? $inventoryMaterial->stock_quantity_current
                    : null,
                'out_of_order_quantity' => !$inventoryMaterial->is_unitary
                    ? $inventoryMaterial->out_of_order_quantity_current
                    : null,
            ]);

            if ($inventoryMaterial->is_unitary) {
                InventoryMaterialUnit::destroy($currentData['outdatedUnits']);

                foreach ($currentData['units'] as $inventoryUnit) {
                    $inventoryUnit->save();

                    $originalUnit = $inventoryUnit->Unit()->first();
                    $originalUnit->update([
                        'is_lost' => $inventoryUnit->is_lost_current,
                        'is_broken' => $inventoryUnit->is_broken_current,
                        'state' => $inventoryUnit->state_current,
                    ]);
                }
            } else {
                $inventoryMaterial->Units()->delete();
            }
        }

        // - Fixe les données globales de l'inventaire.
        $this->update(['is_tmp' => false, 'date' => new \DateTime]);

        return $this->refresh();
    }

    public function getPdfName(int $id): string
    {
        $inventory = static::findOrFail($id);
        if ($inventory->is_tmp) {
            throw new \LogicException("Impossible de sortir le PDF d'un inventaire non terminé.");
        }

        $i18n = new I18n(Config::getSettings('defaultLang'));
        $date = $inventory->date ?: new \DateTime();

        $fileName = sprintf(
            '%s-%s-%s.pdf',
            $i18n->translate('Inventory'),
            slugify($inventory->park->name),
            $date->format('Y-m-d')
        );
        if (isTestMode()) {
            $fileName = sprintf('TEST-%s', $fileName);
        }

        return $fileName;
    }

    public function getPdfContent(int $id): string
    {
        $inventory = static::findOrFail($id);
        if ($inventory->is_tmp) {
            throw new \LogicException("Impossible de sortir le PDF d'un inventaire non terminé.");
        }

        $totals = [
            'previous' => 0,
            'difference' => 0,
            'current' => 0,
            'broken' => 0,
        ];

        $inventoryMaterials = $inventory->materials->toArray();
        foreach ($inventoryMaterials as &$material) {
            $hasMissingUnits = false;
            $hasBrokenUnits = false;
            $newUnitsCount = 0;

            if ($material['is_unitary']) {
                $hasMissingUnits = in_array(true, array_column($material['units'], 'is_lost_current'));
                $hasBrokenUnits = in_array(true, array_column($material['units'], 'is_broken_current'));
                $newUnitsCount = count(array_filter($material['units'], function ($unit) {
                    return (bool)$unit['is_new'];
                }));
                $foundUnitsCount = count(array_filter($material['units'], function ($unit) {
                    return $unit['is_lost_previous'] && !$unit['is_lost_current'];
                }));
                $material['stock_quantity_previous'] = count($material['units']) - $newUnitsCount - $foundUnitsCount;

                foreach ($material['units'] as &$unit) {
                    $unitExtraInfos = MaterialUnit::find($unit['material_unit_id']);
                    $unit = array_merge($unit, [
                        'owner' => $unitExtraInfos->owner['full_name'],
                        'purchaseDate' => $unitExtraInfos->purchase_date,
                    ]);
                }
            }

            $countDifference = $material['stock_quantity_current'] - $material['stock_quantity_previous'];

            $materialExtraInfos = Material::find($material['material_id']);
            $replacementValue = $materialExtraInfos->replacement_price * $material['stock_quantity_current'];

            $totals['previous'] += $material['stock_quantity_previous'];
            $totals['difference'] += $countDifference;
            $totals['current'] += $material['stock_quantity_current'];
            $totals['broken'] += $material['out_of_order_quantity_current'];
            $totals['replacementValue'] += $replacementValue;

            $material = array_merge($material, [
                'replacementPrice' => $materialExtraInfos->replacement_price,
                'totalReplacementPrice' => $replacementValue,
                'hasMissing' => (
                    $material['stock_quantity_current'] < $material['stock_quantity_previous'] ||
                    $hasMissingUnits
                ),
                'hasBroken' => (
                    $material['out_of_order_quantity_current'] > 0 ||
                    $material['out_of_order_quantity_previous'] > 0 && (
                        $material['out_of_order_quantity_previous'] <= $material['out_of_order_quantity_current']
                    ) ||
                    $hasBrokenUnits
                ),
                'countDifference' => $countDifference,
            ]);
        }

        usort($inventoryMaterials, function ($a, $b) {
            return strcmp($a['reference'], $b['reference']);
        });

        $pdfData = [
            'date' => $inventory->date ?: new \DateTime(),
            'locale' => Config::getSettings('defaultLang'),
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
            'parkName' => $inventory->park->name,
            'author' => $inventory->author ? $inventory->author->person()->first()->full_name : null,
            'materials' => $inventoryMaterials,
            'totals' => $totals,
        ];

        $billPdf = $this->_getPdfAsString($pdfData);
        if (!$billPdf) {
            $lastError = error_get_last();
            throw new \RuntimeException(sprintf(
                "Unable to create PDF file. Reason: %s",
                $lastError['message']
            ));
        }

        return $billPdf;
    }
}
