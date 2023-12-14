<?php
declare(strict_types=1);

namespace Loxya\Services;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler;
use Psr\Log\LoggerTrait;
use Loxya\Support\Str;

final class Logger
{
    use LoggerTrait;

    private \Monolog\Logger $globalLogger;

    private $settings = [
        'timezone' => null,
        'max_files' => 5,
        'level' => \Monolog\Logger::NOTICE,
    ];

    /**
     * Constructeur.
     *
     * @param array $settings La configuration du logger.
     */
    public function __construct(array $settings = [])
    {
        $this->settings = array_replace($this->settings, $settings);

        if ($this->settings['timezone'] !== null) {
            if (is_string($this->settings['timezone'])) {
                $this->settings['timezone'] = new \DateTimeZone($this->settings['timezone']);
            }
        }

        if (!is_numeric($this->settings['level'])) {
            $levels = array_keys(\Monolog\Logger::getLevels());
            if (!in_array(strtoupper($this->settings['level']), $levels, true)) {
                $this->settings['level'] = \Monolog\Logger::NOTICE;
            }
        }

        $this->globalLogger = $this->createLogger('app');
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques
    // -
    // ------------------------------------------------------

    /**
     * Permet de créer un logger.
     *
     * @param string $name Le nom (unique) du logger.
     *
     * @return \Monolog\Logger Une instance du logger tout juste créé.
     */
    public function createLogger(string $name): \Monolog\Logger
    {
        $logger = new \Monolog\Logger($name);

        // - Timezone
        if (!empty($this->settings['timezone'])) {
            $logger->setTimezone($this->settings['timezone']);
        }

        // - Handler
        $path = LOGS_FOLDER . DS . Str::slugify($name) . '.log';
        $handler = new Handler\RotatingFileHandler(
            $path,
            $this->settings['max_files'],
            $this->settings['level']
        );
        $handler->setFormatter(new LineFormatter(null, null, true, true));
        $logger->pushHandler($handler);

        return $logger;
    }

    /**
     * Ajoute un message de log.
     *
     * @param int $level Le niveau de log.
     * @param string $message Le message à logger.
     * @param array $context Le contexte du log (si utile).
     */
    public function log($level, $message, array $context = []): void
    {
        $this->globalLogger->log($level, $message, $context);
    }
}
