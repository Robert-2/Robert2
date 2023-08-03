/**
 * Compare deux chaînes de caractères en utilisant les règles de la locale courante,
 * en ignorant la ponctuation et la casse, et en prenant en compte l'ordre naturel
 * des nombres.
 *
 * @param a - La première chaîne de caractère à utiliser pour la comparaison.
 * @param b - La seconde chaîne de caractère à utiliser pour la comparaison.
 *
 * @returns `-1`, `0` ou `1` selon le résultat de la comparaison:
 *          - `-1` signifie que `a` se situe avant `b` alphabétiquement.
 *          - `0` signifie que les chaînes sont équivalentes.
 *          - `1` signifie que `b` se situe avant `a` alphabétiquement.
 */
const stringCompare = (a: string, b: string): number => {
    const result = a.localeCompare(b, undefined, {
        ignorePunctuation: true,
        sensitivity: 'base',
        numeric: true,
    });

    // NOTE: Corrige les différences de support en fonction des navigateurs.
    // (Qui, en fonction des versions, peuvent retourner des valeurs différentes de -1, 0 et 1)
    // Voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
    return result !== 0 ? (result > 0 ? 1 : -1) : 0;
};

export default stringCompare;
