<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Services\I18n;

final class I18nTest extends TestCase
{
    public function testTranslate()
    {
        $result = (new I18n('fr'))->translate("{{name}} must be iterable");
        $this->assertEquals("Doit être itérable", $result);

        $result = (new I18n('en'))->translate("{{name}} must be iterable");
        $this->assertEquals("Must be iterable", $result);

        // - Avec une langue + région.
        $result = (new I18n('en_US'))->translate("{{name}} must be iterable");
        $this->assertEquals("Must be iterable", $result);
    }

    public function testTranslatePlural()
    {
        $result = (new I18n('fr'))->plural("items-count", 5);
        $this->assertEquals("5 articles", $result);

        $result = (new I18n('en'))->plural("items-count", 5);
        $this->assertEquals("5 items", $result);
    }

    public function testGetLanguage()
    {
        $this->assertEquals('fr', (new I18n('fr'))->getLanguage());
        $this->assertEquals('en', (new I18n('en'))->getLanguage());

        // - Avec une langue + région.
        $this->assertEquals('fr', (new I18n('fr_CH'))->getLanguage());
    }

    public function testGetLocale()
    {
        $this->assertEquals('fr_FR', (new I18n('fr'))->getLocale());
        $this->assertEquals('en_GB', (new I18n('en'))->getLocale());

        // - Avec une langue + région.
        $this->assertEquals('en_US', (new I18n('en_US'))->getLocale());
    }
}
