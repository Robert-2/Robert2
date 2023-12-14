<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

/**
 * Une exception levée si un conflit est rencontré.
 */
class ConflictException extends \RuntimeException
{
    /**
     * Un conflit dû au fait qu'une tentative d'assignation d'un
     * technicien a échoué vu qu'il est déjà mobilisé à ce moment.
     */
    public const TECHNICIAN_ALREADY_BUSY = 1;
}
