<?php
declare(strict_types=1);

namespace Robert2\Tests\Events;

use Robert2\API\Models\Attribute;
use Robert2\API\Models\Material;
use Robert2\Tests\TestCase;

final class AttributeCategoryTest extends TestCase
{
    public function testAttachCategoriesToAttribute(): void
    {
        $attribute = Attribute::findOrFail(2);

        // Pour la caractéristique #2 ("Couleur", qui n'avait pas de limite),
        // on limite à la catégorie #2 ("Lumière")
        $attribute->categories()->attach(2);

        // La valeur pour cette caractéristique dans le matériel #1 doit être
        // supprimée, car il fait partie de la catégorie #1.
        $material = Material::findOrFail(1);
        $this->assertSame([1, 3], $material->attributes->pluck('id')->all());
    }

    public function testDetachCategoriesFromAttribute(): void
    {
        $attribute = Attribute::findOrFail(3);

        // On enlève la limite de catégorie #1 ("Son") à la caractéristique #3 ("Puissance"),
        // qui est aussi limitée à la catégorie #2 ("Lumière").
        $attribute->categories()->detach(1);

        // Les caractéristiques des matériels concernés doivent être supprimées.
        $material = Material::findOrFail(1);
        $this->assertSame([1, 2], $material->attributes->pluck('id')->all());
        $material = Material::findOrFail(2);
        $this->assertSame([1], $material->attributes->pluck('id')->all());

        // Celles des matériels de la catégorie restante ne doivent pas être supprimées.
        $material = Material::findOrFail(3);
        $this->assertSame([1, 3], $material->attributes->pluck('id')->all());
        $material = Material::findOrFail(4);
        $this->assertSame([1, 3, 4], $material->attributes->pluck('id')->all());
    }
}
