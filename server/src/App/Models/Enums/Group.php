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
    public const ADMIN = 'admin';

    /** Représente le groupe des membres de l'équipe. */
    public const MEMBER = 'member';

    /** Représente le groupe des visiteurs. */
    public const VISITOR = 'visitor';

    // ------------------------------------------------------
    // -
    // -    Méthodes publiques
    // -
    // ------------------------------------------------------

    public static function all(): array
    {
        return [
            Group::VISITOR,
            Group::MEMBER,
            Group::ADMIN,
        ];
    }
}
