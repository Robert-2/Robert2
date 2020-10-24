<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportV1;

class Processor
{
    public $count = 0;
    public $lastIndex = 0;
    public $autoFieldsMap = [];

    protected $model;
    protected $data = [];
    protected $forcedData = [];

    public function import(array $data, int $fromIndex = 0)
    {
        if (method_exists($this, '_preProcess')) {
            $data = $this->_preProcess($data);
        }

        $newData = $this->_convertAutoFields($data);

        foreach ($newData as $index => $item) {
            if ($index < $fromIndex) {
                continue;
            }
            $this->lastIndex = $index;

            $newItem = array_merge($item, $this->forcedData);
            $this->model->edit(null, $newItem);

            $this->count += 1;
        }
    }

    protected function _convertAutoFields(array $data): array
    {
        return array_map(function ($item) {
            $newItem = [];
            foreach ($item as $field => $value) {
                if (!$this->autoFieldsMap[$field]) {
                    continue;
                }

                $newField = $this->autoFieldsMap[$field]['field'];
                if (empty($value) && !($value === '0' || $value === 0 || $value === false)) {
                    $newItem[$newField] = null;
                    continue;
                }

                switch ($this->autoFieldsMap[$field]['type']) {
                    case 'int':
                        $newItem[$newField] = (int)$value;
                        break;
                    case 'float':
                        $newItem[$newField] = (float)$value;
                        break;
                    case 'bool':
                        $newItem[$newField] = (bool)$value;
                        break;
                    case 'array':
                        $newItem[$newField] = (array)$value;
                        break;
                    default:
                        $newItem[$newField] = (string)$value;
                }
            }
            return $newItem;
        }, $data);
    }
}
