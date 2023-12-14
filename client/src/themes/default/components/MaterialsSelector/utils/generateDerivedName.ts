type NameParts = { base: string, count: number };

// @see https://regex101.com/r/kqWJzp/3
const DERIVED_NAME_PATTERN = /^(?:(?<base>.+?)[ \t]+)?\((?<count>[0-9]+)\)$/;

const extractNameParts = (name: string): NameParts => {
    const matches = name.match(DERIVED_NAME_PATTERN)?.groups ?? { base: name, count: '1' };
    const { base = '', count: rawCount } = matches as { base?: string, count: string };
    return { base: base.trim(), count: Math.max(1, parseInt(rawCount, 10)) };
};

/**
 * Permet de générer un nom à partir d'un autre.
 *
 * @example
 * - Un nom d'origine "Ma liste" donnera "Ma liste (1)".
 * - Un nom d'origine "Ma liste (11)" donnera "Ma liste (12)".
 * - Un nom d'origine "(2)" donnera "(3)".
 *
 * @param name - La nom d'origine, à partir de laquelle le nouveau nom sera généré.
 * @param otherNames - Les autres noms dont il faut tenir compte lors de la création
 *                     du nom dérivé (optionnel).
 *
 * @returns Le nom dérivé du nom d'origine.
 */
const generateDerivedName = (name: string, otherNames: string[] = []): string => {
    const { base, count: originCount } = extractNameParts(name);

    const otherDerivedNamesCount = otherNames
        .map((otherName: string) => extractNameParts(otherName))
        .filter((otherNameParts: NameParts) => (
            otherNameParts.base.toLowerCase() === base.toLowerCase() &&
            otherNameParts.count > originCount
        ))
        .map((otherNameParts: NameParts) => otherNameParts.count);

    const count = Math.max(originCount, ...otherDerivedNamesCount);
    return `${base} (${count + 1})`.trim();
};

export default generateDerivedName;
