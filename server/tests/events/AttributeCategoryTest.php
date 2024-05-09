<?php
declare(strict_types=1);

namespace Loxya\Tests\Events;

use Illuminate\Database\Eloquent\Collection;
use Loxya\Models\Attribute;
use Loxya\Models\Material;
use Loxya\Tests\TestCase;

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
        /** @var Collection<array-key, Attribute> $attributes */
        $attributes = Material::findOrFail(1)->attributes;
        $this->assertSame([1, 3], $attributes->pluck('id')->all());
    }

    public function testDetachCategoriesFromAttribute(): void
    {
        $attribute = Attribute::findOrFail(3);

        // On enlève la limite de catégorie #1 ("Son") à la caractéristique #3 ("Puissance"),
        // qui est aussi limitée à la catégorie #2 ("Lumière").
        $attribute->categories()->detach(1);

        //
        // - Les caractéristiques des matériels concernés doivent être supprimées.
        //

        /** @var Collection<array-key, Attribute> $attributes */
        $attributes = Material::findOrFail(1)->attributes;
        $this->assertSame([1, 2], $attributes->pluck('id')->all());

        /** @var Collection<array-key, Attribute> $attributes */
        $attributes = Material::findOrFail(2)->attributes;
        $this->assertSame([1], $attributes->pluck('id')->all());

        //
        // - Celles des matériels de la catégorie restante ne doivent pas être supprimées.
        //

        /** @var Collection<array-key, Attribute> $attributes */
        $attributes = Material::findOrFail(3)->attributes;
        $this->assertSame([1, 3], $attributes->pluck('id')->all());

        /** @var Collection<array-key, Attribute> $attributes */
        $attributes = Material::findOrFail(4)->attributes;
        $this->assertSame([1, 3, 4], $attributes->pluck('id')->all());
    }
}
