/**
 * Fusionne deux tableaux en conservant les éléments communs et en
 * ajoutant les éléments uniques du second tableau.
 *
 * Les éléments de `a` qui existent aussi dans `b` conserveront leur
 * ordre jusqu'à ce qu'au premier élément qui n'est pas dans `b`.
 *
 * @param a - Le premier tableau.
 * @param b - Le second tableau.
 *
 * @example
 * ```ts
 * const result = mergeDifference([1, 2, 3], [3, 4, 5]);
 * console.log(result); // [3, 4, 5]
 * ```
 *
 * @returns - Un tableau contenant les éléments communs à `a` et `b`
 *            ainsi que les éléments uniques de `b`.
 */
const mergeDifference = <T extends string | number>(a: T[], b: T[]): T[] => (
    [...new Set([...a.filter((v: T) => b.includes(v)), ...b])]
);

export default mergeDifference;
