<?php

namespace Robert2\API\Validation;

use Robert2\API\I18n\I18n;
use Respect\Validation\Factory;
use Respect\Validation\Validator as CoreValidator;
use Respect\Validation\Exceptions\NestedValidationException;

class Validator extends CoreValidator
{
    public function assert($input)
    {
        try {
            parent::assert($input);
        } catch (NestedValidationException $e) {
            $e->setParam('translator', [new I18n, 'translate']);
            throw $e;
        }

        return true;
    }

    // ------------------------------------------------------
    // -
    // -    Static methods
    // -
    // ------------------------------------------------------

    protected static function getFactory()
    {
        if (!static::$factory instanceof Factory) {
            static::$factory = new Factory();
            static::$factory->prependRulePrefix('Robert2\\API\\Validation\\Rules');
        }
        return static::$factory;
    }
}
