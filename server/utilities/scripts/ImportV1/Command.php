<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportV1;

use Symfony\Component\Console\Command\Command as ConsoleCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class Command extends ConsoleCommand
{
    protected $start = 0;
    protected $entity;
    protected $data;
    protected $processor;

    private $output;

    protected $entitiesProcessors = [
        'technicians' => 'Technicians',
        'materials'   => 'Materials',
    ];

    protected function configure()
    {
        $this->setName('import-v1')
            ->setDescription('Importe les données depuis la première version de Robert (0.6.x)')
            ->setHelp('Utilisez cette commande pour importer les données depuis Robert 0.6.x.')
            ->addOption('start', 's', InputOption::VALUE_OPTIONAL, "Index de la donnée à partir de laquelle vous souhaitez commencer l'import", 0)
            ->addArgument('entity', InputArgument::REQUIRED, "Nom de l'entité à importer.");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->output = $output;

        $this->start = (int)$input->getOption('start');
        $this->entity = $input->getArgument('entity');

        $this->checkEntity();

        $this->initData();

        $this->out('info', "\Bonjour!\nCommençons l'import de l'entité « $this->entity » vers Robert2.");
        $startMessage = "Importation de $this->preCount éléments";
        if ($this->start > 0) {
            $startMessage .= ", en débutant à l'index $this->start";
        }
        $this->out('info', "$startMessage...");

        $this->initProcessor();
        $this->process();

        $this->out('success', "[END] À bientôt !");
    }

    protected function process()
    {
        $this->out('info', sprintf(
            "Champs de l'entité:\n  - '%s'",
            implode("'\n  - '", array_keys($this->processor->autoFieldsMap))
        ));

        try {
            $this->processor->import($this->data, $this->start);
            $count = $this->processor->count;

            $this->out('success', "OK, $count éléments importés.");
        } catch (\Exception $e) {
            $lastIndex = $this->processor->lastIndex;
            $this->out('error', sprintf(
                "Une erreur est survenue à l'index %d. Message d'erreur:\n« %s »",
                $lastIndex,
                $e->getMessage()
            ));

            if (method_exists($e, 'getValidationErrors')) {
                $this->out('error', json_encode($e->getValidationErrors(), JSON_PRETTY_PRINT));
            }

            $count = $this->processor->count;
            $this->out('warning', "[END] $count éléments ont été importés.");

            if ($count > 0 || $lastIndex > 0) {
                $this->out(
                    'warning',
                    "Attention: Assurez vous de redémarrer l'import avec l'option: --start=$lastIndex"
                );
            }
            exit(1);
        }
    }

    // ------------------------------------------------------
    // -
    // -    Check methods
    // -
    // ------------------------------------------------------

    protected function checkEntity()
    {
        if (!in_array($this->entity, array_keys($this->entitiesProcessors))) {
            $this->out('error', sprintf(
                "\ERREUR:\nEntité inconnue « %s ». Les entités connues sont:\n  - %s",
                $this->entity,
                implode("\n  - ", array_keys($this->entitiesProcessors))
            ));
            exit(1);
        }
    }

    protected function initData()
    {
        $fileName = $this->entity . '.php';
        $filePath = DATA_FOLDER . DS . 'imports' . DS . $fileName;

        if (!file_exists($filePath)) {
            $this->out('error', "\ERREUR:\nLe fichier de données de l'entité n'a pas été trouvé. Veuillez créer le fichier:\n`$filePath`");
            exit(1);
        }

        $this->data = require($filePath);
        if (!is_array($this->data) || empty($this->data)) {
            $this->out(
                'error',
                "\nERROR:\n" .
                "<error>Le fichier de données de l'entité existe mais ne semble pas contenir de données.</error>\n" .
                "<error>Assurez-vous que le fichier retourne directement les données à importer.</error>"
            );
            exit(1);
        }

        $this->preCount = count($this->data);
    }

    protected function initProcessor()
    {
        $processorName = $this->entitiesProcessors[$this->entity];
        $processorClass = "Robert2\\Scripts\\ImportV1\\Processors\\$processorName";

        if (!class_exists($processorClass)) {
            $this->out(
                'error',
                "Le processeur de données n'a pas été trouvé.\n" .
                "Veuillez créer la classe `$processorClass.php`."
            );
            exit(1);
        }

        $this->processor = new $processorClass;
    }

    // ------------------------------------------------------
    // -
    // -    Private Methods
    // -
    // ------------------------------------------------------

    private function out(string $type, string $message)
    {
        if (!$this->output) {
            return;
        }

        $colors = [
            'error'   => '1;31', // - Light red
            'warning' => '1;33', // - Light yellow
            'info'    => '0;36', // - Cyan
            'success' => '1;32', // - Light green
        ];

        $this->output->writeln(
            sprintf("\033[%sm%s\033[0m\n", $colors[$type], $message)
        );
    }
}
