<?php
declare(strict_types=1);

namespace Loxya\Http\Enums;

/**
 * Contextes de l'application (Où se trouve l'utilisateur ?).
 *
 * TODO: En PHP 8.1, migrer vers une énumération.
 *       Voir https://www.php.net/manual/fr/language.enumerations.php
 */
class AppContext
{
    /**
     * Back-office de l'application.
     * (= Partie accessible par les membres du staff).
     */
    public const INTERNAL = 'internal';
}
