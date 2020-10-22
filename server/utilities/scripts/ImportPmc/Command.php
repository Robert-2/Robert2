<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportPmc;

use Symfony\Component\Console\Command\Command as ConsoleCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Command extends ConsoleCommand
{
    protected function configure()
    {
        $this->setName('import-pmc')
            ->setDescription("[PMC Milliot] Importe les données des commandes Simax dans Robert2.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->write('// TODO :)');
    }
}
