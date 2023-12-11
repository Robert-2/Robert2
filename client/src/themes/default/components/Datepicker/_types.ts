import type { Moment } from 'moment';

export enum Type {
    /** Sélection de ou des dates uniquement (jour, mois, année). */
    DATE = 'date',

    /** Sélection de date et heures. */
    DATETIME = 'datetime',
}

/** Représente une valeur avec un format permissif pour une date seule. */
export type LooseDateValue = string | null | undefined;

/** Représente une valeur avec un format permissif pour le sélecteur de date. */
export type LooseValue<IsRange extends boolean = boolean> = (
    | (
        IsRange extends true
            ? [start: LooseDateValue, end: LooseDateValue]
            : LooseDateValue
    )
    | undefined
    | null
);

/** Représente la valeur pour une date seule. */
export type DateValue = string | null;

/** Représente la valeur du sélecteur de date. */
export type Value<IsRange extends boolean = boolean> = (
    IsRange extends true
        ? [start: DateValue, end: DateValue]
        : DateValue
);

//
// - Snippets
//

export type RawDateSnippet = {
    labelKey: string,
    period(now: Moment): Moment,
};

export type RawRangeSnippet = {
    labelKey: string,
    period(now: Moment): [start: Moment, end: Moment],
};

export type Snippet = {
    label: string,
    periodLabel: string,
    isActive: boolean,
    period: Date | [Date, Date],
};
