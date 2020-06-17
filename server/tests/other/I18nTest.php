<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\API\I18n\I18n;

final class I18nTest extends ModelTestCase
{
    public function testTranslate()
    {
        $i18n   = new I18n();
        $result = $i18n->translate("{{name}} must be iterable");
        $this->assertEquals("{{name}} must be iterable", $result);

        $i18n   = new I18n('fr');
        $result = $i18n->translate("{{name}} must be iterable");
        $this->assertEquals("{{name}} doit être itérable", $result);
    }

    public function testTranslatePlural()
    {
        $i18n   = new I18n();
        $result = $i18n->plural("There is %d event in this period", 5);
        $this->assertEquals("There are 5 events in this period", $result);

        $i18n   = new I18n('fr');
        $result = $i18n->plural("There is %d event in this period", 5);
        $this->assertEquals("Il y a 5 événements dans cette période", $result);
    }

    public function testGetCurrentLocale()
    {
        $i18n = new I18n();
        $this->assertEquals('en', $i18n->getCurrentLocale());

        $i18n = new I18n('fr');
        $this->assertEquals('fr', $i18n->getCurrentLocale());
    }
}
