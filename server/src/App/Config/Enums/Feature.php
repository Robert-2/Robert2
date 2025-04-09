<?php
declare(strict_types=1);

namespace Loxya\Config\Enums;

/** Fonctionnalités de l'application. */
enum Feature: string
{
    /** Gestion des techniciens */
    case TECHNICIANS = 'technicians';
}
