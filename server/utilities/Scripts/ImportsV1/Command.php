<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportsV1;

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
        $this->setName('import')
            ->setDescription('Import data from first version of Robert (0.6.x)')
            ->setHelp('Use this command to import data from Robert 0.6.x DB format.')
            ->addOption('start', 's', InputOption::VALUE_OPTIONAL, "Index of data from which to start import", 0)
            ->addArgument('entity', InputArgument::REQUIRED, 'Name of the entity to import');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->output = $output;

        $this->start = (int)$input->getOption('start');
        $this->entity = $input->getArgument('entity');

        $this->checkEntity();

        $this->initData();

        $this->out('info', "\nHello!\nLet's import entity « $this->entity » to Robert2.");
        $startMessage = "Importing $this->preCount items";
        if ($this->start > 0) {
            $startMessage .= ", starting from index $this->start";
        }
        $this->out('info', "$startMessage...");

        $this->initProcessor();
        $this->process();

        $this->out('success', "[END] Bye!");
    }

    protected function process()
    {
        $this->out('info', sprintf(
            "Entity input fields:\n  - '%s'",
            implode("'\n  - '", array_keys($this->processor->autoFieldsMap))
        ));

        try {
            $this->processor->import($this->data, $this->start);
            $count = $this->processor->count;

            $this->out('success', "OK, $count items imported.");
        } catch (\Exception $e) {
            $lastIndex = $this->processor->lastIndex;
            $this->out('error', sprintf(
                "An error occurred at index %d of data set. Error message:\n« %s »",
                $lastIndex,
                $e->getMessage()
            ));

            if (method_exists($e, 'getValidationErrors')) {
                $this->out('error', json_encode($e->getValidationErrors(), JSON_PRETTY_PRINT));
            }

            $count = $this->processor->count;
            $this->out('warning', "[END] $count items were imported.");

            if ($count > 0 || $lastIndex > 0) {
                $this->out(
                    'warning',
                    "Warning: make sure to restart your import with following option: --start=$lastIndex"
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
                "\nERROR:\nUnknown entity « %s ». Currently known entities are:\n  - %s",
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
            $this->out('error', "\nERROR:\nEntity data file not found. Please create the file\n`$filePath`");
            exit(1);
        }

        $this->data = require($filePath);
        if (!is_array($this->data) || empty($this->data)) {
            $this->out(
                'error',
                "\nERROR:\n" .
                "<error>Entity file exists but no data found in '$fileName'.</error>\n" .
                "<error>Please make sure that this file returns directly the data to import.</error>"
            );
            exit(1);
        }

        $this->preCount = count($this->data);
    }

    protected function initProcessor()
    {
        $processorName = $this->entitiesProcessors[$this->entity];
        $processorClass = "Robert2\\Scripts\\ImportsV1\\Processors\\$processorName";

        if (!class_exists($processorClass)) {
            $this->out(
                'error',
                "Entity's processor class not found.\n" .
                "Please create class `$processorClass.php`."
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

        // $exit = ($type === 'error' && $withExit === null) || $withExit;
        // if ($exit) {
        //     exit(1);
        // }
    }
}
