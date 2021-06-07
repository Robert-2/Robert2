<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

class MaterialsData
{
    protected $materials;
    protected $categories;
    protected $parks;

    public function __construct(array $materials)
    {
        $this->materials = $materials;
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function setCategories(array $categories): self
    {
        $this->categories = $categories;
        return $this;
    }

    public function setParks(array $parks): self
    {
        $this->parks = $parks;
        return $this;
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getBySubCategories(bool $withHidden = false): array
    {
        $subCategoriesMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $subCategoryId = $material['sub_category_id'] ?: 0;

            if (!isset($subCategoriesMaterials[$subCategoryId])) {
                $subCategoriesMaterials[$subCategoryId] = [
                    'id' => $subCategoryId ?: null,
                    'name' => $this->getSubCategoryName($subCategoryId),
                    'materials' => [],
                ];
            }

            $reference = $material['reference'];
            $stockQuantity = $material['stock_quantity'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $units = null;
            if ($material['is_unitary']) {
                $units = [];
                $stockQuantity = 0;

                foreach ($material['units'] as $unit) {
                    $stockQuantity += 1;

                    if (array_key_exists('pivot', $material)
                        && !in_array($unit['id'], $material['pivot']['units'])
                    ) {
                        continue;
                    }

                    $units[] = [
                        'name' => $unit['reference'],
                        'park' => count($this->parks) > 1 ? $this->getParkName($unit['park_id']) : null,
                    ];
                }
            }

            $withPark = count($this->parks) > 1 && !empty($material['park_id']);

            $subCategoriesMaterials[$subCategoryId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $stockQuantity,
                'attributes' => $material['attributes'],
                'park' => $withPark ? $this->getParkName($material['park_id']) : null,
                'quantity' => $quantity,
                'units' => $units,
                'rentalPrice' => $price,
                'replacementPrice' => $replacementPrice,
                'total' => $price * $quantity,
                'totalReplacementPrice' => $replacementPrice * $quantity,
            ];
        }

        foreach ($subCategoriesMaterials as $subCategoryId => $content) {
            ksort($subCategoriesMaterials[$subCategoryId]['materials'], SORT_NATURAL | SORT_FLAG_CASE);
        }

        return array_reverse(array_values($subCategoriesMaterials));
    }

    public function getByParks(bool $withHidden = false)
    {
        $parksMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $reference = $material['reference'];
            $stockQuantity = $material['stock_quantity'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            if ($material['is_unitary']) {
                $units = [];

                foreach ($material['units'] as $unit) {
                    if (array_key_exists('pivot', $material)
                        && !in_array($unit['id'], $material['pivot']['units'])
                    ) {
                        continue;
                    }

                    $unitParkId = $unit['park_id'];

                    if (!isset($parksMaterials[$unitParkId])) {
                        $parksMaterials[$unitParkId] = [
                            'id' => $unitParkId,
                            'name' => $this->getParkName($unitParkId),
                            'materials' => [],
                        ];
                    }

                    $unitData = [
                        'name' => $unit['reference'],
                        'park' => null,
                    ];

                    if (isset($parksMaterials[$unitParkId]['materials'][$reference])) {
                        $quantity += 1;
                        $units[] = $unitData;
                    } else {
                        $quantity = 1;
                        $units = [$unitData];
                    }

                    $parksMaterials[$unitParkId]['materials'][$reference] = [
                        'reference' => $reference,
                        'name' => $material['name'],
                        'stockQuantity' => $stockQuantity,
                        'attributes' => $material['attributes'],
                        'park' => null,
                        'units' => $units,
                        'quantity' => $quantity,
                        'rentalPrice' => $price,
                        'replacementPrice' => $replacementPrice,
                        'total' => $price * $quantity,
                        'totalReplacementPrice' => $replacementPrice * $quantity,
                    ];
                }

                continue;
            }

            $parkId = $material['park_id'];

            if (!isset($parksMaterials[$parkId])) {
                $parksMaterials[$parkId] = [
                    'id' => $parkId,
                    'name' => $parkId ? $this->getParkName($parkId) : null,
                    'materials' => [],
                ];
            }

            $parksMaterials[$parkId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $stockQuantity,
                'attributes' => $material['attributes'],
                'park' => null,
                'units' => null,
                'quantity' => $quantity,
                'rentalPrice' => $price,
                'replacementPrice' => $replacementPrice,
                'total' => $price * $quantity,
                'totalReplacementPrice' => $replacementPrice * $quantity,
            ];
        }

        foreach ($parksMaterials as $parkId => $park) {
            ksort($parksMaterials[$parkId]['materials'], SORT_NATURAL | SORT_FLAG_CASE);
        }

        usort($parksMaterials, function ($a, $b) {
            return strcmp($a['name'] ?: '', $b['name'] ?: '');
        });

        return array_values($parksMaterials);
    }

    public function getAllFlat(bool $withHidden = false)
    {
        $flatMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $withPark = count($this->parks) > 1 && !empty($material['park_id']);

            $reference = $material['reference'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $units = null;
            if ($material['is_unitary']) {
                $units = [];
                $stockQuantity = 0;

                foreach ($material['units'] as $unit) {
                    $stockQuantity += 1;

                    if (array_key_exists('pivot', $material)
                        && !in_array($unit['id'], $material['pivot']['units'])
                    ) {
                        continue;
                    }

                    $units[] = [
                        'name' => $unit['reference'],
                        'park' => count($this->parks) > 1 ? $this->getParkName($unit['park_id']) : null,
                    ];
                }
            }

            $flatMaterials[$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
                'units' => $units,
                'park' => $withPark ? $this->getParkName($material['park_id']) : null,
                'quantity' => $quantity,
                'rentalPrice' => $price,
                'replacementPrice' => $replacementPrice,
                'total' => $price * $quantity,
                'totalReplacementPrice' => $replacementPrice * $quantity,
            ];
        }

        ksort($flatMaterials, SORT_NATURAL | SORT_FLAG_CASE);

        return $flatMaterials;
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function getSubCategoryName(int $subCategoryId): ?string
    {
        if (empty($this->categories)) {
            throw new \InvalidArgumentException("Missing categories data.");
        }

        foreach ($this->categories as $category) {
            foreach ($category['sub_categories'] as $subCategory) {
                if ($subCategoryId === $subCategory['id']) {
                    return $subCategory['name'];
                }
            }
        }

        return null;
    }

    protected function getParkName(int $parkId): ?string
    {
        if (empty($this->parks)) {
            throw new \InvalidArgumentException("Missing parks data.");
        }

        foreach ($this->parks as $park) {
            if ($parkId === $park['id']) {
                return $park['name'];
            }
        }

        return null;
    }
}
