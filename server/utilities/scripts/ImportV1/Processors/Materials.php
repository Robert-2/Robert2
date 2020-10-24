<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportV1\Processors;

use Robert2\Scripts\ImportV1\Processor;
use Robert2\API\Models\Material;
use Robert2\API\Models\Park;
use Robert2\API\Models\Category;

class Materials extends Processor
{
    public $autoFieldsMap = [
        'id'        => null,
        'label'     => ['type' => 'string', 'field' => 'name'],
        'ref'       => ['type' => 'string', 'field' => 'reference'],
        'panne'     => ['type' => 'int', 'field' => 'out_of_order_quantity'],
        'externe'   => null,
        'categorie' => null,
        'sousCateg' => null,
        'Qtotale'   => ['type' => 'int', 'field' => 'stock_quantity'],
        'tarifLoc'  => ['type' => 'float', 'field' => 'rental_price'],
        'valRemp'   => ['type' => 'float', 'field' => 'replacement_price'],
        'dateAchat' => null,
        'ownerExt'  => null,
        'remarque'  => ['type' => 'string', 'field' => 'note'],

        // Added in _preProcess method
        'parkId'     => ['type' => 'int', 'field' => 'park_id'],
        'categoryId' => ['type' => 'int', 'field' => 'category_id']
    ];

    public function __construct()
    {
        $this->model = new Material;
    }

    // ------------------------------------------------------
    // -
    // -    Specific Methods
    // -
    // ------------------------------------------------------

    protected function _preProcess(array $data): array
    {
        $transliterator = null;
        if (in_array('intl', get_loaded_extensions())) {
            $transliterator = \Transliterator::create('NFD; [:Nonspacing Mark:] Remove; NFC');
        }

        return array_map(function ($item) use ($transliterator) {
            if ($transliterator) {
                $item['ref'] = $transliterator->transliterate($item['ref']);
            }

            $item['parkId'] = 1;
            if (!empty($item['ownerExt'])) {
                $park = Park::where('name', $item['ownerExt'])->first();
                if (!$park) {
                    $newPark = new Park;
                    $park = $newPark->edit(null, ['name' => $item['ownerExt']]);
                }
                $item['parkId'] = (int)$park->id;
            }

            $category = Category::where('name', $item['categorie'])->first();
            if (!$category) {
                $newCategory = new Category;
                $category = $newCategory->edit(null, ['name' => $item['categorie']]);
            }
            $item['categoryId'] = (int)$category->id;

            return $item;
        }, $data);
    }
}
