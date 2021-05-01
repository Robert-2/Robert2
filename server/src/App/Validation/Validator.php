<?php

namespace Robert2\API\Validation;

use Respect\Validation\Exceptions\NestedValidationException;
use Respect\Validation\Factory;
use Respect\Validation\Validator as CoreValidator;
use Robert2\API\Services\I18n;

class Validator extends CoreValidator
{
    public function assert($input)
    {
        try {
            parent::assert($input);
        } catch (NestedValidationException $e) {
            // TODO: Laisser le front gérer le traduction des messages de validation.
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
