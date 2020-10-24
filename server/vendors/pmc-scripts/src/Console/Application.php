<?php

namespace PmcScripts\Console;

use PmcScripts\Console\Command\ImportEvent;
use PmcScripts\Console\Command\ImportMaterial;
use Symfony\Component\Console\Application as CoreApplication;

class Application extends CoreApplication
{
    public function __construct()
    {
        parent::__construct("Scripts PMC Milliot pour Robert2.");

        $this->addCommands([
            new ImportEvent(),
            new ImportMaterial(),
        ]);
    }
}
