<?php
declare(strict_types=1);

namespace Loxya\Errors\Enums;

/**
 * Codes d'erreur retournés par l'API.
 *
 * NOTE IMPORTANTE:
 * En cas de modif., pensez à aussi mettre à jour le fichier lié dans la partie front-end.
 * {@see {@link /client/src/stores/api/@codes.ts}}
 *
 * TODO: En PHP 8.1, migrer vers une énumération.
 *       Voir https://www.php.net/manual/fr/language.enumerations.php
 */
class ApiErrorCode
{
    /** Erreur inconnue ou sans prise en charge. */
    public const UNKNOWN = 0;

    //
    // - Erreurs liées aux formulaires.
    //

    /** Une erreur ou plusieurs erreurs de validation ce sont produites. */
    public const VALIDATION_FAILED = 400;

    /** Le payload fourni dans la requête ne doit pas être vide. */
    public const EMPTY_PAYLOAD = 401;

    //
    // - Conflits.
    //

    /**
     * Un conflit dû au fait qu'une tentative d'assignation d'un
     * technicien a échoué vu qu'il est déjà mobilisé à ce moment.
     */
    public const TECHNICIAN_ALREADY_BUSY = 201;
}
