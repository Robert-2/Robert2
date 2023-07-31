<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\SubCategory;

final class SubCategoryTest extends TestCase
{
    public function testCreateDuplicate(): void
    {
        // - Ajoute une sous-catégorie qui a le même nom qu'une autre,
        //   mais dans une catégorie différente
        $result = SubCategory::new(['name' => 'Gradateurs', 'category_id' => 1]);
        $this->assertNotNull($result->toArray());

        // - Tente d'ajouter une sous-catégorie qui existe déjà pour cette catégorie
        $this->expectException(ValidationException::class);
        SubCategory::new(['name' => 'Gradateurs', 'category_id' => 2]);
    }
}
