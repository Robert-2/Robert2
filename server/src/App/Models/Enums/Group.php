<?php
declare(strict_types=1);

namespace Loxya\Models\Enums;

/**
 * Groupes des utilisateurs de l'application.
 *
 * #TODO: Migrer vers un `enum`.
 */
final class Group
{
    /** Représente le groupe des administrateurs. */
    public const ADMINISTRATION = 'administration';

    /** Représente le groupe des gestionnaires, membres de l'équipe. */
    public const MANAGEMENT = 'management';

    /**
     * Représente le groupe des utilisateurs ayant accès au
     * planning général, en lecture seule.
     */
    public const READONLY_PLANNING_GENERAL = 'readonly-planning-general';

    /**
     * Représente le groupe des utilisateurs ayant uniquement accès
     * à leur propre planning, en lecture seule.
     */
    public const READONLY_PLANNING_SELF = 'readonly-planning-self';

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques
    // -
    // ------------------------------------------------------

    public static function all(): array
    {
        return [
            Group::READONLY_PLANNING_SELF,
            Group::READONLY_PLANNING_GENERAL,
            Group::MANAGEMENT,
            Group::ADMINISTRATION,
        ];
    }
}
