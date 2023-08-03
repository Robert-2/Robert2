<?php
declare(strict_types=1);

namespace Loxya\Console;

use Loxya\Config\Config;
use Loxya\Kernel;
use Symfony\Component\Console\Application as BaseApplication;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\ListCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\ConsoleOutputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class App extends BaseApplication
{
    private $container;

    private $commandsRegistered = false;
    private $registrationErrors = [];

    public function __construct()
    {
        $this->container = Kernel::boot()->getContainer();

        parent::__construct('Loxya', Config::getVersion());

        /* phpcs:disable Generic.Files.LineLength.TooLong */
        $inputDefinition = $this->getDefinition();
        $inputDefinition->addOption(new InputOption('env', 'e', InputOption::VALUE_REQUIRED, "L'environnement à utiliser.", Config::getEnv()));
        /* phpcs:enable Generic.Files.LineLength.TooLong */
    }

    /**
     * Runs the current application.
     *
     * @return int 0 if everything went fine, or an error code
     */
    public function doRun(InputInterface $input, OutputInterface $output)
    {
        $this->registerCommands();

        if ($this->registrationErrors) {
            $this->renderRegistrationErrors($input, $output);
        }

        return parent::doRun($input, $output);
    }

    /**
     * {@inheritdoc}
     */
    protected function doRunCommand(Command $command, InputInterface $input, OutputInterface $output)
    {
        if (!$command instanceof ListCommand) {
            if ($this->registrationErrors) {
                $this->renderRegistrationErrors($input, $output);
                $this->registrationErrors = [];
            }

            return parent::doRunCommand($command, $input, $output);
        }

        $returnCode = parent::doRunCommand($command, $input, $output);

        if ($this->registrationErrors) {
            $this->renderRegistrationErrors($input, $output);
            $this->registrationErrors = [];
        }

        return $returnCode;
    }

    /**
     * {@inheritdoc}
     */
    public function find(string $name)
    {
        $this->registerCommands();

        return parent::find($name);
    }

    /**
     * {@inheritdoc}
     */
    public function get(string $name)
    {
        $this->registerCommands();

        return parent::get($name);
    }

    /**
     * {@inheritdoc}
     */
    public function all(?string $namespace = null)
    {
        $this->registerCommands();

        return parent::all($namespace);
    }

    /**
     * {@inheritdoc}
     */
    public function add(Command $command)
    {
        $this->registerCommands();

        return parent::add($command);
    }

    protected function registerCommands()
    {
        if ($this->commandsRegistered) {
            return;
        }
        $this->commandsRegistered = true;

        if ($this->container->has('console.commands')) {
            foreach ($this->container->get('console.commands') as $command) {
                try {
                    $this->add($command);
                } catch (\Throwable $e) {
                    $this->registrationErrors[] = $e;
                }
            }
        }
    }

    private function renderRegistrationErrors(InputInterface $input, OutputInterface $output)
    {
        if ($output instanceof ConsoleOutputInterface) {
            $output = $output->getErrorOutput();
        }

        (new SymfonyStyle($input, $output))->warning('Some commands could not be registered:');

        foreach ($this->registrationErrors as $error) {
            $this->doRenderThrowable($error, $output);
        }
    }
}
