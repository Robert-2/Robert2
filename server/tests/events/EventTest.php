<?php
declare(strict_types=1);

namespace Loxya\Tests\Events;

use Loxya\Models\Estimate;
use Loxya\Models\Event;
use Loxya\Models\Invoice;
use Loxya\Tests\TestCase;

final class EventTest extends TestCase
{
    public function testDeleteEventAlsoRemoveInvoices(): void
    {
        Event::findOrFail(1)->delete();

        // - Si l'événement est supprimé, ses factures et devis doivent l'être aussi.
        //   (ceci est géré "manuellement" car ce sont des entités polymorphes)
        $this->assertNull(Invoice::find(1));
        $this->assertNull(Estimate::find(1));
    }
}
