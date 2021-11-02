<?php
declare(strict_types=1);

namespace Robert2\API\Console\Command\Migrations;

use Robert2\API\Config\Config;
use Phinx\Console\Command\Rollback as CoreRollbackCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class RollbackCommand extends CoreRollbackCommand
{
    use ConfigurationTrait;

    protected static $defaultName = 'migrations:rollback';

    protected function configure()
    {
        /* phpcs:disable Generic.Files.LineLength.TooLong */
        $this
            ->setAliases(['rollback'])
            ->setDescription("Rollback la dernière migration (ou jusqu'à une migration spécifique).")
            ->setHelp(implode(PHP_EOL, [
                "La commande <info>migrations:rollback</info> rollback (= annule) la dernière migration (ou jusqu'à une migration spécifique)",
                "",
                "<info>bin/console migrations:rollback</info>",
                "<info>bin/console migrations:rollback --target 20211024185412</info>",
                "<info>bin/console migrations:rollback --date 20211024</info>",
                "<info>bin/console migrations:rollback --date 20211024 --fake</info>",
                "<info>bin/console migrations:rollback --dry-run</info>"
            ]))
            ->addOption('target', 't', InputOption::VALUE_REQUIRED, "Le numéro de migration jusqu'à laquelle revenir.")
            ->addOption('date', 'd', InputOption::VALUE_REQUIRED, "Le date jusqu'à laquelle vous souhaitez revenir.")
            ->addOption('dry-run', 'x', InputOption::VALUE_NONE, "Affiche les requêtes au lieu de les exécuter.")
            ->addOption('fake', null, InputOption::VALUE_REQUIRED, "Marque les migrations sélectionnées comme \"annulées\", sans pour autant exécuter quoi que ce soit.");
        /* phpcs:enable Generic.Files.LineLength.TooLong */
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        // - Phinx utilise `environment` plutôt que `env`, donc on ajoute l'alias artificiellement.
        $this->addOption('environment', null, InputOption::VALUE_REQUIRED, '', Config::getEnv());

        // - Options volontairement non exposées (= ne font pas sens dans le contexte de l'application).
        $this->addOption('force');

        return parent::execute($input, $output);
    }
}
