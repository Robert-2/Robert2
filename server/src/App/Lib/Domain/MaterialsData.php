<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

use Illuminate\Support\Collection;
use Robert2\API\Models\Category;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Models\SubCategory;

class MaterialsData
{
    protected $materials;

    /**
     * @param Collection|Material[] $materials
     */
    public function __construct(Collection $materials)
    {
        $this->materials = $materials->toArray();
    }

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function getByCategories(bool $withHidden = false): array
    {
        $hasMultipleParks = Park::count() > 1;

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
                    'name' => $categoryId ? Category::find($categoryId)->name : null,
                    'materials' => [],
                ];
            }

            $reference = $material['reference'];
            $stockQuantity = $material['stock_quantity'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $withPark = $hasMultipleParks && !empty($material['park_id']);
            $park = Park::find($material['park_id']);

            $categoriesMaterials[$categoryId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $stockQuantity,
                'attributes' => $material['attributes'],
                'park' => ($withPark && $park) ? $park->name : null,
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

        usort($categoriesMaterials, function ($a, $b) {
            if ($a['name'] === null) {
                return 1;
            }
            if ($b['name'] === null) {
                return -1;
            }
            return strcasecmp($a['name'], $b['name']);
        });

        return $categoriesMaterials;
    }

    public function getBySubCategories(bool $withHidden = false): array
    {
        $hasMultipleParks = Park::count() > 1;

        $subCategoriesMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $categoryId = $material['category_id'] ?: 0;
            $subCategoryId = $material['sub_category_id'] ?: sprintf('c-%d', $categoryId);
            $subCategory = SubCategory::find($material['sub_category_id']);

            if (!isset($subCategoriesMaterials[$subCategoryId])) {
                $subCategoriesMaterials[$subCategoryId] = [
                    'id' => $subCategoryId,
                    'name' => $subCategory ? $subCategory->name : null,
                    'category' => $categoryId ? Category::find($categoryId)->name : null,
                    'categoryHasSubCategories' => $categoryId ? Category::hasSubCategories($categoryId) : false,
                    'materials' => [],
                ];
            }

            $reference = $material['reference'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $withPark = $hasMultipleParks && !empty($material['park_id']);
            $park = Park::find($material['park_id']);

            $subCategoriesMaterials[$subCategoryId]['materials'][$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
                'park' => ($withPark && $park) ? $park->name : null,
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
            if ($a['category'] === null) {
                return 1;
            }
            if ($b['category'] === null) {
                return -1;
            }
            $noNameSortReplacer = 'ZZZZZZZZ';
            $aString = sprintf('%s%s', $a['category'], $a['name'] ?: $noNameSortReplacer);
            $bString = sprintf('%s%s', $b['category'], $b['name'] ?: $noNameSortReplacer);
            return strnatcasecmp($aString, $bString);
        });

        return $subCategoriesMaterials;
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
            $park = Park::find($parkId);
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;

            if (!isset($parksMaterials[$parkId])) {
                $parksMaterials[$parkId] = [
                    'id' => $parkId,
                    'name' => $park ? $park->name : null,
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
            return strnatcasecmp($a['name'] ?: '', $b['name'] ?: '');
        });

        return array_values($parksMaterials);
    }

    public function getAllFlat(bool $withHidden = false)
    {
        $hasMultipleParks = Park::count() > 1;

        $flatMaterials = [];
        foreach ($this->materials as $material) {
            $isHidden = $material['is_hidden_on_bill'];
            $price = $material['rental_price'];
            if ($isHidden && $price === 0.0 && !$withHidden) {
                continue;
            }

            $reference = $material['reference'];
            $quantity = array_key_exists('pivot', $material) ? $material['pivot']['quantity'] : 0;
            $replacementPrice = $material['replacement_price'];

            $withPark = $hasMultipleParks && !empty($material['park_id']);
            $park = Park::find($material['park_id']);

            $flatMaterials[$reference] = [
                'reference' => $reference,
                'name' => $material['name'],
                'stockQuantity' => $material['stock_quantity'],
                'attributes' => $material['attributes'],
                'park' => ($withPark && $park) ? $park->name : null,
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
