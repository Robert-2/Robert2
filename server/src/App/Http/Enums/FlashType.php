<?php
declare(strict_types=1);

namespace Loxya\Http\Enums;

/**
 * Types de messages flash.
 *
 * TODO: En PHP 8.1, migrer vers une énumération.
 *       Voir https://www.php.net/manual/fr/language.enumerations.php
 */
class FlashType
{
    /**
     * Message flash de type "succès".
     */
    public const SUCCESS = 'success';

    /**
     * Message flash de type "erreur".
     */
    public const ERROR = 'error';
}
