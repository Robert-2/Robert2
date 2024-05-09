<?php
declare(strict_types=1);

namespace Loxya\Errors\Enums;

/**
 * Codes d'erreur retournés par l'API.
 *
 * NOTE IMPORTANTE:
 * En cas de modif., pensez à aussi mettre à jour le fichier lié dans la partie front-end.
 * {@see {@link /client/src/stores/api/@codes.ts}}
 */
enum ApiErrorCode: int
{
    /** Erreur inconnue ou sans prise en charge. */
    case UNKNOWN = 0;

    //
    // - Erreurs liées aux réservations.
    //

    /**
     * Les réservations ne sont pas ouvertes dans cette application.
     * (ou en tous cas pas pour cet utilisateur / bénéficiaire)
     */
    case RESERVATION_DISABLED = 100;

    /**
     * Si un panier de réservation a expiré.
     *
     * Note: Ce code n'est accessible que pendant 1 heure à partir du
     * moment ou le panier a expiré. Au delà, ce sera comme si le panier
     * n'avait jamais existé (Voir `RESERVATION_CART_MISSING`).
     */
    case RESERVATION_CART_EXPIRED = 101;

    /** S'il n'y a aucun panier de réservation en cours. */
    case RESERVATION_CART_MISSING = 102;

    //
    // - Erreurs liées aux formulaires.
    //

    /** Une erreur ou plusieurs erreurs de validation ce sont produites. */
    case VALIDATION_FAILED = 400;

    /** Le payload fourni dans la requête ne doit pas être vide. */
    case EMPTY_PAYLOAD = 401;
}
