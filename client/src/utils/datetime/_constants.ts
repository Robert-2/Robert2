import type { TimeUnit, TimeUnitLong } from '@/utils/rawDatetime';

/** Formats pré-définis compréhensible par un humain. */
export enum ReadableFormat {
    /** Format court (e.g. `01/12/2024 - 14:38`) */
    SHORT = 'L - HH:mm',

    /** Format moyen (e.g. `1 déc 2024 - 14:38`) */
    MEDIUM = 'll - HH:mm',

    /** Format long (e.g. `1 décembre 2024 - 14:38`) */
    LONG = 'LL - HH:mm',
}

/** Méthode d'arrondi pour les dates. */
export enum RoundingMethod {
    /** Arrondi à "l'étape" supérieure. */
    CEIL = 'ceil',

    /** Arrondi à "l'étape" la plus proche. */
    ROUND = 'round',

    /** Arrondi à "l'étape" inférieure. */
    FLOOR = 'floor',
}

/** Nombre d'heures dans une journée. */
const HOURS_PER_DAY: number = 24;

/** Nombre de minutes dans une heure. */
const MINUTE_PER_HOUR: number = 60;

/** Nombre de secondes dans une minute. */
const SECONDS_PER_MINUTE: number = 60;

/** Nombre de millisecondes dans une seconde. */
const MILLISECONDS_PER_SECONDS: number = 1000;

export const TIME_UNITS_MAX: Record<TimeUnitLong, number> = {
    'millisecond': MILLISECONDS_PER_SECONDS,
    'second': SECONDS_PER_MINUTE,
    'minute': MINUTE_PER_HOUR,
    'hour': HOURS_PER_DAY,
};

export const TIME_UNITS_MAP: Record<TimeUnit, TimeUnitLong> = {
    milliseconds: 'millisecond',
    millisecond: 'millisecond',
    ms: 'millisecond',
    seconds: 'second',
    second: 'second',
    s: 'second',
    minutes: 'minute',
    minute: 'minute',
    m: 'minute',
    hours: 'hour',
    hour: 'hour',
    h: 'hour',
};

export const TIME_UNITS: TimeUnit[] = Object.keys(TIME_UNITS_MAP) as TimeUnit[];
