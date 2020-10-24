<?php
declare(strict_types=1);

namespace PmcScripts\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportMaterialCommand extends Command
{
    protected function configure()
    {
        $this->setName('import-material')
            ->setDescription("[PMC Milliot] Importe du matériel dans Robert2.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->write("<error>Cetter commande n'est pas encore implémentée.</error>");
    }
}
