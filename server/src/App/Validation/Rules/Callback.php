<?php

namespace Robert2\API\Validation\Rules;

use Respect\Validation\Exceptions\ComponentException;
use Respect\Validation\Exceptions\NestedValidationException;
use Respect\Validation\Rules\AbstractRule;
use Respect\Validation\Validator;

class Callback extends AbstractRule
{
    public $callback;
    public $arguments;

    public function __construct($callback)
    {
        if (!is_callable($callback)) {
            throw new ComponentException('Invalid callback');
        }

        $arguments = func_get_args();
        array_shift($arguments);

        $this->callback = $callback;
        $this->arguments = $arguments;
    }

    public function assert($input)
    {
        $result = $this->_validate($input);
        if ($result instanceof NestedValidationException) {
            throw $result;
        }

        if ($result) {
            return true;
        }

        throw $this->reportError($input);
    }

    public function validate($input)
    {
        return $this->_validate($input) === true;
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function _validate($input)
    {
        $params = $this->arguments;
        array_unshift($params, $input);

        $result = call_user_func_array($this->callback, $params);
        if (is_bool($result)) {
            return $result;
        }

        if ($result instanceof Validator) {
            try {
                $result->setName($this->name)->assert($input);
            } catch (NestedValidationException $e) {
                $this->setTemplate($e->getFullMessage());
                return $e;
            }
            return true;
        }

        $this->setTemplate($result);
        return false;
    }
}
