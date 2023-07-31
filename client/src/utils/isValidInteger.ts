/**
 * Permet de vérifier qu'une valeur contient bien un entier.
 *
 * @param value - La valeur à vérifier.
 *
 * @returns `true` si la valeur contient un entier, `false` sinon.
 */
const isValidInteger = (value: unknown): value is number | `${number}` => {
    if (typeof value === 'number') {
        return !Number.isNaN(value) && Number.isInteger(value);
    }
    return typeof value === 'string' ? /^-?[0-9]+$/.test(value) : false;
};

export default isValidInteger;
