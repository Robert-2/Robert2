<?php
declare(strict_types=1);

namespace Loxya\Console\Command\Migrations;

use Phinx\Console\Command\Status as CoreStatusCommand;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputOption;

#[AsCommand(name: 'migrations:status')]
class StatusCommand extends CoreStatusCommand
{
    use ConfigurationTrait;

    protected function configure(): void
    {
        /* phpcs:disable Generic.Files.LineLength.TooLong */
        $this
            ->setDescription("Affiche le statut des migrations.")
            ->setHelp(implode(PHP_EOL, [
                "La commande <info>migrations:status</info> affiche une liste de toutes les migrations avec leur état respectif actuel.",
                "",
                "<info>bin/console migrations:status</info>",
                "<info>bin/console migrations:status --format json</info>",
            ]))
            ->addOption('format', 'f', InputOption::VALUE_REQUIRED, "Le format de sortie: `text` (par défaut) ou `json`.");
        /* phpcs:enable Generic.Files.LineLength.TooLong */
    }
}
