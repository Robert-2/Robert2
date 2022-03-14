<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

use Robert2\API\Models\Category;
use Robert2\API\Models\Park;
use Robert2\API\Models\SubCategory;

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

    public function getByCategories(bool $withHidden = false): array
    {
        $categoriesMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $categoryId = $material['category_id'] ?: 0;

            if (!isset($categoriesMaterials[$categoryId])) {
                $categoriesMaterials[$categoryId] = [
                    'id' => $categoryId ?: null,
                    'name' => Category::find($categoryId)->name,
                    'materials' => [],
                ];
            }

            $reference = $material['reference'];
            $stockQuantity = $material['stock_quantity'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $withPark = count($this->parks) > 1 && !empty($material['park_id']);

            $categoriesMaterials[$categoryId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $stockQuantity,
                'attributes' => $material['attributes'],
                'park' => $withPark ? Park::find($material['park_id'])->name : null,
                'quantity' => $quantity,
                'rentalPrice' => $price,
                'replacementPrice' => $replacementPrice,
                'total' => $price * $quantity,
                'totalReplacementPrice' => $replacementPrice * $quantity,
            ];
        }

        foreach ($categoriesMaterials as $categoryId => $content) {
            ksort($categoriesMaterials[$categoryId]['materials'], SORT_NATURAL | SORT_FLAG_CASE);
        }

        return array_reverse(array_values($categoriesMaterials));
    }

    public function getBySubCategories(bool $withHidden = false): array
    {
        $subCategoriesMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $categoryId = $material['category_id'];
            $subCategoryId = $material['sub_category_id'] ?: sprintf('c-%d', $categoryId);

            if (!isset($subCategoriesMaterials[$subCategoryId])) {
                $subCategoriesMaterials[$subCategoryId] = [
                    'id' => $subCategoryId,
                    'name' => SubCategory::find($material['sub_category_id'])->name,
                    'category' => Category::find($categoryId)->name,
                    'categoryHasSubCategories' => Category::hasSubCategories($categoryId),
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
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
                'park' => $withPark ? Park::find($material['park_id'])->name : null,
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

        $results = array_values($subCategoriesMaterials);
        usort($results, function ($a, $b) {
            $noNameSortReplacer = 'ZZZZZZZZ';
            $aString = sprintf('%s%s', $a['category'], $a['name'] ?: $noNameSortReplacer);
            $bString = sprintf('%s%s', $b['category'], $b['name'] ?: $noNameSortReplacer);
            return strcasecmp($aString, $bString);
        });

        return $results;
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
                    'name' => $parkId ? Park::find($parkId)->name : null,
                    'materials' => [],
                ];
            }

            $parksMaterials[$parkId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
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
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
                'park' => $withPark ? Park::find($material['park_id'])->name : null,
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
}
