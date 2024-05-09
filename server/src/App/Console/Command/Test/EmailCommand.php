<?php
declare(strict_types=1);

namespace Loxya\Console\Command\Test;

use Loxya\Services\Mailer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'test:email')]
final class EmailCommand extends Command
{
    protected Mailer $mailer;

    public function __construct(Mailer $mailer, ?string $name = null)
    {
        parent::__construct($name);

        $this->mailer = $mailer;
    }

    protected function configure()
    {
        $this
            ->setDescription("Test de la configuration de l'envoi d'e-mails.")
            ->addArgument('address', InputArgument::REQUIRED, "Adresse e-mail à laquelle envoyer le message de test.")
            ->setHelp(implode(PHP_EOL, [
                "Envoie un message de test pour vérifier la configuration des notifications et envoi d'e-mails.",
                "",
                "<info>bin/console test:email [email-address]</info>",
            ]));
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln("Envoi d'un e-mail de test...");

        try {
            $recipient = $input->getArgument('address');
            $subject = "Test de la configuration Loxya";
            $message = "<p>L'envoi des e-mails depuis Loxya fonctionne correctement&nbsp;!</p>";

            $this->mailer->send($recipient, $subject, $message);
        } catch (\Throwable $e) {
            $output->writeln(sprintf("<error>Le test d'envoi a échoué. Raison: %s</error>", $e->getMessage()));
            return Command::FAILURE;
        }

        $output->writeln("<info>Terminé, 1 message de test envoyé.</info>");

        return Command::SUCCESS;
    }
}
