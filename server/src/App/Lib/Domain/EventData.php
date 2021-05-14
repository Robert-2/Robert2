<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

use Robert2\API\Config\Config;

class EventData
{
    public $billNumber;
    public $date;
    public $userId;
    public $eventId;
    public $daysCount;
    public $beneficiaryId;
    public $degressiveRate = 1.0;
    public $discountRate = 0.0;
    public $vatRate = 0.0;

    protected $_eventData;
    protected $materials;
    protected $categories;
    protected $parks;

    public function __construct(\DateTime $date, array $event, string $billNumber, ?int $userId = null)
    {
        if (empty($event) || empty($event['beneficiaries']) || empty($event['materials'])) {
            throw new \InvalidArgumentException(
                "Cannot create EventData value-object without complete event's data."
            );
        }

        $this->_eventData = $event;

        $this->date = $date;
        $this->userId = $userId;
        $this->beneficiaryId = $event['beneficiaries'][0]['id'];
        $this->eventId = $event['id'];
        $this->vatRate = (float)Config::getSettings('companyData')['vatRate'];
        $this->materials = $event['materials'];
        $this->billNumber = $billNumber;

        $this->_setDaysCount();
        $this->_setDegressiveRate();
    }

    // ------------------------------------------------------
    // -
    // -    Setters
    // -
    // ------------------------------------------------------

    public function setDiscountRate(float $rate): self
    {
        $this->discountRate = $rate;
        return $this;
    }

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

    public function getDailyAmount(): float
    {
        if (!$this->materials || count($this->materials) === 0) {
            return 0.0;
        }

        $total = 0.0;
        foreach ($this->materials as $material) {
            $total += $material['rental_price'] * $material['pivot']['quantity'];
        };
        return $total;
    }

    public function getDiscountableDailyAmount(): float
    {
        if (!$this->materials || count($this->materials) === 0) {
            return 0.0;
        }

        $total = 0.0;
        foreach ($this->materials as $material) {
            if (!$material['is_discountable']) {
                continue;
            }

            $total += $material['rental_price'] * $material['pivot']['quantity'];
        };
        return $total;
    }

    public function getReplacementAmount(): float
    {
        if (!$this->materials || count($this->materials) === 0) {
            return 0.0;
        }

        $total = 0.0;
        foreach ($this->materials as $material) {
            $total += $material['replacement_price'] * $material['pivot']['quantity'];
        };
        return $total;
    }

    public function getCategoriesTotals(): array
    {
        $categoriesTotals = [];
        foreach ($this->materials as $material) {
            $price = $material['rental_price'];
            $isHidden = $material['is_hidden_on_bill'];
            if ($isHidden && $price === 0.0) {
                continue;
            }

            $categoryId = $material['category_id'];
            $quantity = $material['pivot']['quantity'];

            if (!isset($categoriesTotals[$categoryId])) {
                $categoriesTotals[$categoryId] = [
                    'id' => $categoryId,
                    'name' => $this->getCategoryName($categoryId),
                    'quantity' => $quantity,
                    'subTotal' => $quantity * $price,
                ];
                continue;
            }

            $categoriesTotals[$categoryId]['quantity'] += $quantity;
            $categoriesTotals[$categoryId]['subTotal'] += $quantity * $price;
        }

        return array_values($categoriesTotals);
    }

    public function getMaterialBySubCategories(bool $withHidden = false): array
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
            $quantity = $material['pivot']['quantity'];
            $replacementPrice = $material['replacement_price'];

            $withPark = count($this->parks) > 1 && !empty($material['park_id']);

            $subCategoriesMaterials[$subCategoryId]['materials'][$reference] = [
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

        foreach ($subCategoriesMaterials as $subCategoryId => $content) {
            ksort($subCategoriesMaterials[$subCategoryId]['materials'], SORT_NATURAL | SORT_FLAG_CASE);
        }

        return array_reverse(array_values($subCategoriesMaterials));
    }

    public function getMaterialByParks(bool $withHidden = false)
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
            $quantity = $material['pivot']['quantity'];

            if (!isset($parksMaterials[$parkId])) {
                $parksMaterials[$parkId] = [
                    'id' => $parkId,
                    'name' => $this->getParkName($parkId),
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

        return array_values($parksMaterials);
    }

    public function getMaterials()
    {
        $materials = [];
        foreach ($this->materials as $material) {
            $materials[] = [
                'id' => $material['id'],
                'name' => $material['name'],
                'reference' => $material['reference'],
                'park_id' => $material['park_id'],
                'category_id' => $material['category_id'],
                'sub_category_id' => $material['sub_category_id'],
                'rental_price' => $material['rental_price'],
                'replacement_price' => $material['replacement_price'],
                'is_hidden_on_bill' => $material['is_hidden_on_bill'],
                'is_discountable' => $material['is_discountable'],
                'quantity' => $material['pivot']['quantity'],
            ];
        }

        return $materials;
    }

    public function toModelArray(): array
    {
        $totals = $this->_calcTotals();

        return [
            'number' => $this->billNumber,
            'date' => $this->date->format('Y-m-d H:i:s'),
            'event_id' => $this->eventId,
            'beneficiary_id' => $this->beneficiaryId,
            'materials' => $this->getMaterials(),
            'degressive_rate' => (string)$this->degressiveRate,
            'discount_rate' => (string)$this->discountRate,
            'vat_rate' => (string)$this->vatRate,
            'due_amount' => (string)round($totals['dueAmount'], 2),
            'replacement_amount' => (string)$this->getReplacementAmount(),
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => $this->userId,
        ];
    }

    public function toPdfTemplateArray(): array
    {
        $totals = $this->_calcTotals();

        return [
            'number' => $this->billNumber,
            'date' => $this->date,
            'event' => $this->_eventData,
            'dailyAmount' => $totals['dailyAmount'],
            'discountableDailyAmount' => $totals['discountableDailyAmount'],
            'daysCount' => $this->daysCount,
            'degressiveRate' => $this->degressiveRate,
            'discountRate' => $this->discountRate / 100,
            'discountAmount' => $totals['discountAmount'],
            'vatRate' => $this->vatRate / 100,
            'totalDailyExclVat' => round($totals['dailyTotal'], 2),
            'totalDailyInclVat' => round($totals['dailyTotalVat'], 2),
            'totalExclVat' => round($totals['dailyTotal'] * $this->degressiveRate, 2),
            'vatAmount' => round($totals['vatAmount'], 2),
            'totalInclVat' => round($totals['dailyTotalVat'] * $this->degressiveRate, 2),
            'totalReplacement' => $this->getReplacementAmount(),
            'categoriesSubTotals' => $this->getCategoriesTotals($this->categories),
            'materialList' => $this->getMaterialBySubCategories(),
            'company' => Config::getSettings('companyData'),
            'locale' => Config::getSettings('defaultLang'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
        ];
    }

    public static function createBillNumber(\DateTime $date, int $lastBillNumber): string
    {
        return sprintf(
            '%s-%05d',
            $date->format('Y'),
            $lastBillNumber + 1
        );
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _setDaysCount(): void
    {
        $start = new \DateTime($this->_eventData['start_date']);
        $end = new \DateTime($this->_eventData['end_date']);
        if (!$start || !$end || ($end < $start)) {
            throw new \InvalidArgumentException("Wrong event dates.");
        }

        $diff = $start->diff($end);
        $this->daysCount = (int)$diff->format('%a') + 1;

        if ($this->daysCount <= 0) {
            throw new \InvalidArgumentException("Days count of event should be 1 or more.");
        }
    }

    protected function _setDegressiveRate(): void
    {
        if (empty($this->daysCount) || $this->daysCount <= 0) {
            throw new \InvalidArgumentException("Days count of event should be 1 or more.");
        }

        $jsFunction = Config::getSettings('degressiveRateFunction');
        if (empty($jsFunction) || !strpos($jsFunction, 'daysCount')) {
            $this->degressiveRate = (float)$this->daysCount;
        }
        $function = preg_replace('/daysCount/', (string)$this->daysCount, $jsFunction);

        $result = null;
        // phpcs:disable
        eval(sprintf('$result = %s;', $function));
        // phpcs:enable
        $this->degressiveRate = !$result ? 1.0 : $result;
    }

    protected function _calcTotals(): array
    {
        $discountableDailyAmount = $this->getDiscountableDailyAmount();
        $discountAmount = ($discountableDailyAmount * ($this->discountRate / 100));

        $dailyAmount = $this->getDailyAmount();
        $dailyTotal = $dailyAmount - $discountAmount;

        $vatAmount = ($dailyTotal * ($this->vatRate / 100));
        $dailyTotalVat = $dailyTotal + $vatAmount;

        $dueAmount = $dailyTotal * $this->degressiveRate;

        return compact(
            'discountableDailyAmount',
            'discountAmount',
            'dailyAmount',
            'dailyTotal',
            'vatAmount',
            'dailyTotalVat',
            'dueAmount'
        );
    }

    protected function getCategoryName(int $categoryId): ?string
    {
        if (empty($this->categories)) {
            throw new \InvalidArgumentException("Missing categories data.");
        }

        foreach ($this->categories as $category) {
            if ($categoryId === $category['id']) {
                return $category['name'];
            }
        }
        return null;
    }

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
