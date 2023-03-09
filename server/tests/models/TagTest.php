<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\Models\Tag;

final class TagTest extends TestCase
{
    public function testBulkAdd(): void
    {
        $this->assertEmpty(Tag::bulkAdd([]));

        // - Ajout de deux tags d'un seul coup
        $result = Tag::bulkAdd(['new-one', 'next-new-one']);
        $this->assertEquals('new-one', @$result[0]['name']);
        $this->assertEquals('next-new-one', @$result[1]['name']);

        // - Ajout de tags avec un qui existait déjà (ne l'ajoute pas deux fois)
        $result = Tag::bulkAdd(['super tag', 'pro']);
        $this->assertEquals('super tag', @$result[0]['name']);
        $this->assertEquals('pro', @$result[1]['name']);
        $this->assertEquals(1, @$result[1]['id']);
    }
}
