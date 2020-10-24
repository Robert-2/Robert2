<?php
declare(strict_types=1);

namespace PmcScripts\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportEvents extends Command
{
    protected function configure()
    {
        $this->setName('import-events')
            ->setDescription("[PMC Milliot] Importe les données des commandes Simax dans Robert2.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeLn('// TODO :)');
    }
}
