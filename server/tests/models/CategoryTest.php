<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Models\Category;

final class CategoryTest extends TestCase
{
    public function testHasSubCategories(): void
    {
        $this->assertTrue(Category::findOrFail(1)->has_sub_categories);
        $this->assertTrue(Category::findOrFail(2)->has_sub_categories);
        $this->assertFalse(Category::findOrFail(3)->has_sub_categories);
        $this->assertFalse(Category::findOrFail(4)->has_sub_categories);
    }

    public function testBulkAdd(): void
    {
        $this->assertEmpty(Category::bulkAdd([]));

        // - Ajout de deux catégories d'un seul coup
        $result = Category::bulkAdd([' one', ' dès ']);
        $this->assertCount(2, $result);
        $this->assertEquals('one', @$result[0]['name']);
        $this->assertEquals('dès', @$result[1]['name']);

        // - Ajout de catégories avec une qui existait déjà (ne l'ajoute pas deux fois)
        $result = Category::bulkAdd(['Nouvelle catégorie', 'Son']);
        $this->assertEquals('Nouvelle catégorie', @$result[0]['name']);
        $this->assertEquals('Son', @$result[1]['name']);
        $this->assertEquals(1, @$result[1]['id']);
    }
}
