<?php
declare(strict_types=1);

namespace Robert2\Lib\Domain;

use Illuminate\Support\Carbon;
use Robert2\API\Config\Config;
use Robert2\API\Models\Category;
use Robert2\API\Models\Event;
use Robert2\API\Models\Park;
use Robert2\API\Models\Setting;

class EventData
{
    protected Event $event;

    protected $daysCount;
    protected $degressiveRate = 1.0;
    protected $discountRate = 0.0;

    public function __construct(Event $event)
    {
        if ($event->beneficiaries->isEmpty() || $event->materials->isEmpty()) {
            throw new \InvalidArgumentException(
                "Cannot create EventData value-object without complete event's data."
            );
        }

        $this->event = $event;
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

    // ------------------------------------------------------
    // -
    // -    Getters
    // -
    // ------------------------------------------------------

    public function toBillingModelData(int $creatorId, ?\DateTimeInterface $date = null, string $number = null): array
    {
        $date = $date ?? new \DateTimeImmutable();
        if ($date instanceof \DateTime) {
            $date = \DateTimeImmutable::createFromMutable($date);
        }

        $totals = $this->_getTotals();
        $vatRate = (float)Config::getSettings('companyData')['vatRate'];
        $materials = $this->event->materials
            ->map(fn ($material) => [
                'id' => $material->id,
                'name' => $material->name,
                'reference' => $material->reference,
                'park_id' => $material->park_id,
                'category_id' => $material->category_id,
                'sub_category_id' => $material->sub_category_id,
                'rental_price' => $material->rental_price,
                'replacement_price' => $material->replacement_price,
                'is_hidden_on_bill' => $material->is_hidden_on_bill,
                'is_discountable' => $material->is_discountable,
                'quantity' => $material->pivot->quantity,
            ])
            ->all();

        return [
            'number' => $number,
            'date' => $date->format('Y-m-d H:i:s'),
            'event_id' => $this->event->id,
            'beneficiary_id' => $this->event->beneficiaries->get(0)->id,
            'materials' => $materials,
            'degressive_rate' => (string) $this->degressiveRate,
            'discount_rate' => (string) $this->discountRate,
            'vat_rate' => (string) $vatRate,
            'due_amount' => (string)round($totals['dueAmount'], 2),
            'replacement_amount' => (string) $this->event->replacement_amount,
            'currency' => Config::getSettings('currency')['iso'],
            'user_id' => $creatorId,
        ];
    }

    public function toBillingPdfData(?\DateTimeInterface $date = null, string $number = null): array
    {
        $date = $date ?? new \DateTimeImmutable();
        if ($date instanceof \DateTime) {
            $date = \DateTimeImmutable::createFromMutable($date);
        }

        $totals = $this->_getTotals();
        $vatRate = (float)Config::getSettings('companyData')['vatRate'];
        $materials = (new MaterialsData($this->event->materials))
            ->getBySubCategories();

        return [
            'number' => $number,
            'date' => $date,
            'event' => $this->_getEventData(),
            'beneficiary' => $this->event->beneficiaries->get(0),
            'dailyAmount' => $totals['dailyAmount'],
            'discountableDailyAmount' => $totals['discountableDailyAmount'],
            'daysCount' => $this->daysCount,
            'degressiveRate' => $this->degressiveRate,
            'discountRate' => $this->discountRate / 100,
            'discountAmount' => $totals['discountAmount'],
            'vatRate' => $vatRate / 100,
            'totalDailyExclVat' => round($totals['dailyTotal'], 2),
            'totalDailyInclVat' => round($totals['dailyTotalVat'], 2),
            'totalExclVat' => round($totals['dailyTotal'] * $this->degressiveRate, 2),
            'vatAmount' => round($totals['vatAmount'], 2),
            'totalInclVat' => round($totals['dailyTotalVat'] * $this->degressiveRate, 2),
            'totalReplacement' => $this->event->replacement_amount,
            'categoriesSubTotals' => $this->_getCategoriesTotals(),
            'materialList' => $materials,
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
        ];
    }

    public function toEventPdfData(?\DateTimeInterface $date = null)
    {
        $date = $date ?? new \DateTimeImmutable();
        if ($date instanceof \DateTime) {
            $date = \DateTimeImmutable::createFromMutable($date);
        }

        // - Matériel
        $hasMultipleParks = Park::count() > 1;
        $materialsData = new MaterialsData($this->event->materials);
        $materialDisplayMode = Setting::getWithKey('eventSummary.materialDisplayMode');
        if ($materialDisplayMode === 'categories') {
            $materialList = $materialsData->getByCategories(true);
        } elseif ($materialDisplayMode === 'sub-categories') {
            $materialList = $materialsData->getBySubCategories(true);
        } elseif ($materialDisplayMode === 'parks' && $hasMultipleParks) {
            $materialList = $materialsData->getByParks(true);
        } else {
            $materialList = $materialsData->getAllFlat(true);
        }

        return [
            'date' => $date,
            'event' => $this->_getEventData(),
            'beneficiaries' => $this->event->beneficiaries,
            'company' => Config::getSettings('companyData'),
            'currency' => Config::getSettings('currency')['iso'],
            'currencyName' => Config::getSettings('currency')['name'],
            'materialList' => $materialList,
            'materialDisplayMode' => $materialDisplayMode,
            'replacementAmount' => $this->event->replacement_amount,
            'technicians' => $this->_getTechnicians(),
            'customText' => Setting::getWithKey('eventSummary.customText'),
            'showLegalNumbers' => Setting::getWithKey('eventSummary.showLegalNumbers'),
        ];
    }

    // ------------------------------------------------------
    // -
    // -    Internal Methods
    // -
    // ------------------------------------------------------

    protected function _setDaysCount(): void
    {
        $start = new \DateTime($this->event->start_date);
        $end = new \DateTime($this->event->end_date);
        if (!$start || !$end || ($end < $start)) {
            throw new \InvalidArgumentException("Wrong event dates.");
        }

        $diff = $start->diff($end);
        $this->daysCount = (int) $diff->format('%a') + 1;

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
            $this->degressiveRate = (float) $this->daysCount;
        }
        $function = preg_replace('/daysCount/', (string) $this->daysCount, $jsFunction);

        $result = null;
        // phpcs:disable
        eval(sprintf('$result = %s;', $function));
        // phpcs:enable
        $this->degressiveRate = !$result ? 1.0 : $result;
    }

    protected function _getEventData(): array
    {
        return $this->event
            ->append(['materials', 'beneficiaries', 'technicians'])
            ->toArray();
    }

    protected function _getTotals(): array
    {
        $discountableDailyAmount = $this->event->discountable_daily_amount;
        $discountAmount = ($discountableDailyAmount * ($this->discountRate / 100));

        $dailyAmount = $this->event->daily_amount;
        $dailyTotal = $dailyAmount - $discountAmount;

        $vatRate = (float)Config::getSettings('companyData')['vatRate'];
        $vatAmount = ($dailyTotal * ($vatRate / 100));
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

    protected function _getCategoriesTotals(): array
    {
        $categories = Category::get()->pluck('name', 'id')->all();

        $categoriesTotals = [];
        foreach ($this->event->materials as $material) {
            $price = $material->rental_price;
            $isHidden = $material->is_hidden_on_bill;
            if ($isHidden && $price === 0.0) {
                continue;
            }

            $categoryId = $material->category_id ?? 0;
            $quantity = $material->pivot->quantity;

            if (!array_key_exists($categoryId, $categoriesTotals)) {
                $name = $categoryId ? ($categories[$categoryId] ?? null) : null;
                $categoriesTotals[$categoryId] = [
                    'id' => $categoryId,
                    'name' => $name,
                    'quantity' => 0,
                    'subTotal' => 0,
                ];
            }

            $categoriesTotals[$categoryId]['quantity'] += $quantity;
            $categoriesTotals[$categoryId]['subTotal'] += $quantity * $price;
        }

        usort($categoriesTotals, function ($a, $b) {
            if ($a['name'] === null) {
                return 1;
            }
            if ($b['name'] === null) {
                return -1;
            }
            return strcasecmp($a['name'], $b['name']);
        });

        return $categoriesTotals;
    }

    protected function _getTechnicians()
    {
        if ($this->event->technicians->isEmpty()) {
            return [];
        }

        $technicians = [];
        foreach ($this->event->technicians as $eventTechnician) {
            $technician = $eventTechnician->technician;

            if (!array_key_exists($technician->id, $technicians)) {
                $technicians[$technician->id] = [
                    'id' => $technician->id,
                    'name' => $technician->full_name,
                    'phone' => $technician->phone,
                    'periods' => [],
                ];
            }

            $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $eventTechnician->start_time, 'UTC');
            $endTime = Carbon::createFromFormat('Y-m-d H:i:s', $eventTechnician->end_time, 'UTC');

            $technicians[$technician->id]['periods'][] = [
                'from' => $startTime,
                'to' => $endTime,
                'position' => $eventTechnician->position,
            ];
        }

        return array_values($technicians);
    }
}
