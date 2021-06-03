<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

use Robert2\API\Config\Config;

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
                    'id' => $subCategoryId,
                    'name' => $this->getSubCategoryName($subCategoryId),
                    'materials' => [],
                ];
            }

            $reference = $material['reference'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $withPark = count($this->parks) > 1 && !empty($material['park_id']);

            $subCategoriesMaterials[$subCategoryId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'park' => $withPark ? $this->getParkName($material['park_id']) : null,
                'stockQuantity' => $material['stock_quantity'],
                'quantity' => $quantity,
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
            $replacementPrice = $material['replacement_price'];

            $parkId = $material['park_id'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;

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
                'park' => null,
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

            $flatMaterials[$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
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

    protected function getSubCategoryName(int $subCategoryId): string
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
        return '---';
    }

    protected function getParkName(int $parkId): string
    {
        if (empty($this->parks)) {
            throw new \InvalidArgumentException("Missing parks data.");
        }

        foreach ($this->parks as $park) {
            if ($parkId === $park['id']) {
                return $park['name'];
            }
        }
        return '---';
    }
}
