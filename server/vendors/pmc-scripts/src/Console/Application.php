<?php

namespace PmcScripts\Console;

use PmcScripts\Console\Command;
use Symfony\Component\Console\Application as CoreApplication;

class Application extends CoreApplication
{
    public function __construct()
    {
        parent::__construct("Scripts PMC Milliot pour Robert2.");

        $this->addCommands([
            new Command\ImportEvents(),
            new Command\ImportMaterials(),
        ]);
    }
}
