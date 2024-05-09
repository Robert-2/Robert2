<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Illuminate\Support\Collection;
use Loxya\Http\Enums\AppContext;
use Loxya\Support\Assert;
use Webmozart\Assert\InvalidArgumentException;

final class AssertTest extends TestCase
{
    public function testEnumExists(): void
    {
        // - Avec une énumération qui existe...
        Assert::enumExists(AppContext::class);

        // - Avec une énumération qui n'existe pas...
        $exception = new InvalidArgumentException('Expected an existing enum name. Got: "__UNKNOwN_ENUM__"');
        $this->assertException($exception, static fn () => (
            Assert::enumExists('__UNKNOwN_ENUM__')
        ));

        // - Avec une énumération qui n'existe pas et un message custom.
        $exception = new InvalidArgumentException("An error message.");
        $this->assertException($exception, static fn () => (
            Assert::enumExists('__UNKNOwN_ENUM__', "An error message.")
        ));
    }

    public function testNotEmpty(): void
    {
        // - Avec diverses valeurs non-vides : Doit continuer de fonctionner normalement.
        foreach (['__NOT_EMPTY__', ['a', 'b']] as $validValue) {
            Assert::notEmpty($validValue);
        }

        // - Avec diverses valeurs vides : Doit continuer de fonctionner normalement.
        foreach ([['', '""'], [[], 'array']] as [$invalidValue, $readableName]) {
            $exception = new InvalidArgumentException(
                sprintf('Expected a non-empty value. Got: %s', $readableName),
            );
            $this->assertException($exception, static fn () => (
                Assert::notEmpty($invalidValue)
            ));
        }

        // - Avec une collection non vide.
        Assert::notEmpty(new Collection(['a', 'b']));

        // - Avec une collection vide...
        $exception = new InvalidArgumentException('Expected a non-empty collection.');
        $this->assertException($exception, static fn () => (
            Assert::notEmpty(new Collection())
        ));

        // - Avec une collection vide et un message custom.
        $exception = new InvalidArgumentException("An error message.");
        $this->assertException($exception, static fn () => (
            Assert::notEmpty(new Collection(), "An error message.")
        ));
    }
}
