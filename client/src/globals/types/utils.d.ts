/** Représente les coordonnées d'une position. */
type Position = { x: number, y: number };

type AnyLiteralObject = Record<string, any>;

type Nullable<T> = { [K in keyof T]: T[K] | null };
