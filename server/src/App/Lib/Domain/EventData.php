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

    public function getMaterialByCategories(bool $withHidden = false): array
    {
        $materialsData = new MaterialsData($this->materials);
        $materialsData->setParks($this->parks)->setCategories($this->categories);

        return $materialsData->getByCategories($withHidden);
    }

    public function getMaterialBySubCategories(bool $withHidden = false): array
    {
        $materialsData = new MaterialsData($this->materials);
        $materialsData->setParks($this->parks)->setCategories($this->categories);

        return $materialsData->getBySubCategories($withHidden);
    }

    public function getMaterialByParks(bool $withHidden = false)
    {
        $materialsData = new MaterialsData($this->materials);
        $materialsData->setParks($this->parks)->setCategories($this->categories);

        return $materialsData->getByParks($withHidden);
    }

    public function getMaterialsFlat(bool $withHidden = false)
    {
        $materialsData = new MaterialsData($this->materials);
        $materialsData->setParks($this->parks)->setCategories($this->categories);

        return $materialsData->getAllFlat($withHidden);
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

    public function getTechnicians()
    {
        if (empty($this->_eventData['technicians'])) {
            return [];
        }

        $technicians = [];
        foreach ($this->_eventData['technicians'] as $eventTechnician) {
            $technician = $eventTechnician['technician'];
            $technicianId = $technician['id'];

            if (!array_key_exists($technicianId, $technicians)) {
                $technicians[$technicianId] = [
                    'id' => $technicianId,
                    'name' => $technician['full_name'],
                    'phone' => $technician['phone'],
                    'periods' => [],
                ];
            }

            $technicians[$technicianId]['periods'][] = [
                'from' => $eventTechnician['start_time'],
                'to' => $eventTechnician['end_time'],
                'position' => $eventTechnician['position'],
            ];
        }

        return array_values($technicians);
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
}
