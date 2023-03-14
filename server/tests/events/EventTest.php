<?php
declare(strict_types=1);

namespace Robert2\Tests\Events;

use Robert2\API\Models\Estimate;
use Robert2\API\Models\Event;
use Robert2\API\Models\Invoice;
use Robert2\Tests\TestCase;

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
