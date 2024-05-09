<?php
declare(strict_types=1);

namespace Loxya\Http\Enums;

/** Types de messages flash. */
enum FlashType: string
{
    /**
     * Message flash de type "succès".
     */
    case SUCCESS = 'success';

    /**
     * Message flash de type "erreur".
     */
    case ERROR = 'error';
}
