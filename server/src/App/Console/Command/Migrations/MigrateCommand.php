<?php
declare(strict_types=1);

namespace Robert2\API\Console\Command\Migrations;

use Phinx\Console\Command\Migrate as CoreMigrateCommand;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputOption;

#[AsCommand(name: 'migrations:migrate', aliases: ['migrate'])]
class MigrateCommand extends CoreMigrateCommand
{
    use ConfigurationTrait;

    protected function configure(): void
    {
        /* phpcs:disable Generic.Files.LineLength.TooLong */
        $this
            ->setDescription("Migre la base de données.")
            ->setHelp(implode(PHP_EOL, [
                "La commande <info>migrate</info> exécute toutes les migrations disponibles.",
                "",
                "<info>bin/console migrate</info>",
                "<info>bin/console migrate --target 20211024081132</info>",
                "<info>bin/console migrate --date 20211024</info>",
                "<info>bin/console migrate --date 20211024 --fake</info>",
                "<info>bin/console migrate --dry-run</info>",
            ]))
            ->addOption('target', 't', InputOption::VALUE_REQUIRED, "Le numéro de migration jusqu'à laquelle migrer.")
            ->addOption('date', 'd', InputOption::VALUE_REQUIRED, "Le date jusqu'à laquelle vous souhaitez revenir.")
            ->addOption('dry-run', 'x', InputOption::VALUE_NONE, "Affiche les requêtes au lieu de les exécuter.")
            ->addOption('fake', null, InputOption::VALUE_REQUIRED, "Marque les migrations sélectionnées comme exécutées, sans pour autant exécuter quoi que ce soit.");
        /* phpcs:enable Generic.Files.LineLength.TooLong */
    }
}
