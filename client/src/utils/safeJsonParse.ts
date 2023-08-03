/**
 * Parse une chaîne de caractères JSON et construit la valeur JavaScript ou l'objet décrit par cette chaîne.
 * Si la chaîne est invalide, `undefined` sera retourné et aucune exception ne sera levée.
 *
 * @param rawJson - La chaîne de caractère à analyser comme du JSON.
 *
 * @returns La valeur correspondante à ce qui était encodé dans la chaîne JSON.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const safeJsonParse = <T extends unknown>(rawJson: string): T | undefined => {
    try {
        return JSON.parse(rawJson);
    } catch {
        return undefined;
    }
};

export default safeJsonParse;
