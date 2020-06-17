<?php

namespace Robert2\API\Validation;

use Respect\Validation\Exceptions\NestedValidationException;

use Robert2\API\I18n\I18n;

class Validator
{
    protected $_errors = [];

    public function validate(array $data, array $rules)
    {
        foreach ($rules as $field => $rule) {
            try {
                $rule->setName($field)->assert(@$data[$field]);
            } catch (NestedValidationException $e) {
                $e->setParam('translator', [new I18n, 'translate']);
                $this->addError($field, $e->getMessages());
            }
        }
    }

    public function addError(string $field, array $message): void
    {
        $this->_errors[$field] = $message;
    }

    public function hasError(): bool
    {
        return count($this->_errors) > 0;
    }

    public function getErrors(): array
    {
        return $this->_errors;
    }
}
