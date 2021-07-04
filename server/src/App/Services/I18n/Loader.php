<?php
declare(strict_types=1);

namespace Robert2\API\Services\I18n;

use DElfimov\Translate\Loader\ContainerException as TranslationContainerException;
use DElfimov\Translate\Loader\NotFoundException as TranslationNotFoundException;
use DElfimov\Translate\Loader\PhpFilesLoader;

class Loader extends PhpFilesLoader
{
    /**
     * @inheritDoc
     */
    public function loadMessages($force = false)
    {
        if (isset($this->messages[$this->language]) && !$force) {
            return;
        }

        parent::loadMessages($force);

        $this->messages[$this->language] = new \Adbar\Dot($this->messages[$this->language]);
    }

    /**
     * @inheritDoc
     */
    public function get($path)
    {
        if (empty($path) || !is_string($path)) {
            throw new TranslationContainerException('Message must be a string');
        }
        if (!$this->has($path)) {
            throw new TranslationNotFoundException('Message not found');
        }
        return $this->messages[$this->language]->get($path);
    }

    /**
     * @inheritDoc
     */
    public function has($path)
    {
        if (empty($path) || !is_string($path)) {
            throw new TranslationContainerException('Message must be a string');
        }
        return isset($this->messages[$this->language]) && $this->messages[$this->language]->has($path);
    }
}
