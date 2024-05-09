import type {
    Unit as DateTimeUnit,
    UnitWithWeek as DateTimeUnitWithWeek,
    UnitWithQuarter as DateTimeUnitWithQuarter,
    ManipulateUnit as DateTimeManipulateUnit,
} from '@/utils/datetime';

//
// - Constants
//

/** Formats pré-définis compréhensible par un humain. */
export enum ReadableFormat {
    /** Format court (e.g. `01/12/2024`) */
    SHORT = 'L',

    /** Format moyen (e.g. `1 déc 2024`) */
    MEDIUM = 'll',

    /** Format long (e.g. `1 décembre 2024`) */
    LONG = 'LL',
}

export const EXCLUDED_UNITS = [
    'h', 'm', 's', 'ms',
    'hour', 'minute', 'second', 'millisecond',
    'hours', 'minutes', 'seconds', 'milliseconds',
] as const;

export const EXCLUDED_UNITS_WITH_DAY = [
    ...EXCLUDED_UNITS,
    'day', 'days', 'd',
] as const;

//
// - Types
//

type ExcludedUnit = typeof EXCLUDED_UNITS[number];
type ExcludedUnitWithDay = typeof EXCLUDED_UNITS_WITH_DAY[number];

export type Unit = Exclude<DateTimeUnit, ExcludedUnit>;
export type UnitWithoutDay = Exclude<DateTimeUnit, ExcludedUnitWithDay>;

export type UnitWithWeek = Exclude<DateTimeUnitWithWeek, ExcludedUnit>;
export type UnitWithWeekWithoutDay = Exclude<DateTimeUnitWithWeek, ExcludedUnitWithDay>;

export type UnitWithQuarter = Exclude<DateTimeUnitWithQuarter, ExcludedUnit>;
export type UnitWithQuarterWithoutDay = Exclude<DateTimeUnitWithQuarter, ExcludedUnitWithDay>;

export type ManipulateUnit = Exclude<DateTimeManipulateUnit, ExcludedUnit>;
export type ManipulateUnitWithoutDay = Exclude<DateTimeManipulateUnit, ExcludedUnitWithDay>;
