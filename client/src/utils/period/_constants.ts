/** Formats pré-définis compréhensible par un humain. */
export enum ReadableFormat {
    /**
     * Format minimaliste.
     *
     * @example
     * - `1 déc.`
     * - `1 déc. > 3 déc.`
     * - `1 déc. - 14:38 > 3 déc. - 18:00`
     */
    MINIMALIST = 'MINIMALIST',

    /**
     * Format court.
     *
     * @example
     * - `le 01/12/2024`
     * - `du 01/12/2024 au 03/12/2024`
     * - `du 01/12/2024 - 14:38 au 03/12/2024 - 18:00`
     */
    SHORT = 'SHORT',

    /**
     * Format moyen.
     *
     * @example
     * - `le 1 déc 2024`
     * - `du 1 déc 2024 au 3 déc 2024`
     * - `du 1 déc 2024 - 14:38 au 3 déc 2024 - 18:00`
     */
    MEDIUM = 'MEDIUM',

    /**
     * Format long.
     *
     * @example
     * - `le 1 décembre 2024`
     * - `du 1 décembre 2024 au 3 décembre 2024`
     * - `du 1 décembre 2024 - 14:38 au 3 décembre 2024 - 18:00`
     */
    LONG = 'LONG',

    /**
     * Format "dans une phrase".
     *
     * Ce format peut être utilisé dans des phrases du type:
     * - `(...) pour [période formatée dans ce format]`
     *   Ce qui donnera par exemple:
     *   - "La requête pour la période du 01/12/2024 - 10:00 au 01/12/2024 - 14:30"
     *   - "La requête pour le 01/12/2024"
     *
     * - `(...) pendant [période formatée dans ce format]`
     *   Ce qui donnera par exemple:
     *   - "Le matériel mobilisé pendant la période du 01/12/2024 - 10:00 au 01/12/2024 - 14:30"
     *   - "Le matériel mobilisé pendant le 01/12/2024"
     *
     * @example
     * - `le 01/12/2024`
     * - `la période du 01/12/2024 au 02/12/2024`
     * - `la période du 01/12/2024 - 10:00 au 02/12/2024 - 14:30`
     */
    SENTENCE = 'SENTENCE',
}

/**
 * Formats pré-définis compréhensible par un humain pour les
 * parties prises séparément dans la période.
 */
export enum PartReadableFormat {
    /**
     * Format court.
     *
     * En fonction du type de période, équivalent à:
     * - {@link DateTimeReadableFormat.SHORT}
     * - {@link DayReadableFormat.SHORT}
     */
    SHORT = 'SHORT',

    /**
     * Format moyen.
     *
     * En fonction du type de période, équivalent à:
     * - {@link DateTimeReadableFormat.MEDIUM}
     * - {@link DayReadableFormat.MEDIUM}
     */
    MEDIUM = 'MEDIUM',

    /**
     * Format long.
     *
     * En fonction du type de période, équivalent à:
     * - {@link DateTimeReadableFormat.LONG}
     * - {@link DayReadableFormat.LONG}
     */
    LONG = 'LONG',
}
