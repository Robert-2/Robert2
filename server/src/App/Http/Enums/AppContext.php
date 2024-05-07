<?php
declare(strict_types=1);

namespace Loxya\Http\Enums;

/** Contextes de l'application (Où se trouve l'utilisateur ?). */
enum AppContext: string
{
    /**
     * Back-office de l'application.
     * (= Partie accessible par les membres du staff).
     */
    case INTERNAL = 'internal';
}
