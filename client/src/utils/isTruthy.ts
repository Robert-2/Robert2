type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

/**
 * Retourne `true` si la valeur passée est "truthy", `false` sinon.
 *
 * Cette fonction est particulièrement utile dans lorsqu'utilisée
 * avec le pattern `[foo, condition && bar].filter(Boolean)` pour
 * conserver le bon typage TypeScript.
 *
 * @param value - La valeur à vérifier.
 *
 * @returns `true` si la valeur passée est "truthy", `false` sinon.
 */
const isTruthy = <T>(value: T): value is Truthy<T> => !!value;

export default isTruthy;
