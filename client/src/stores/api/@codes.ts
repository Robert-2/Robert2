/* eslint-disable import/prefer-default-export */

/**
 * Codes d'erreur retournés par l'API.
 *
 * NOTE IMPORTANTE:
 * En cas de modif., pensez à aussi mettre à jour le fichier lié dans la partie back-end.
 * {@see {@link /server/src/App/Errors/Enums/ApiErrorCode.php}}
 */
export enum ApiErrorCode {
    /** Erreur inconnue ou sans prise en charge. */
    UNKNOWN = 0,

    //
    // - Erreurs liées aux formulaires.
    //

    /** Une erreur ou plusieurs erreurs de validation ce sont produites. */
    VALIDATION_FAILED = 400,

    /** Le payload fourni dans la requête ne doit pas être vide. */
    EMPTY_PAYLOAD = 401,
}
