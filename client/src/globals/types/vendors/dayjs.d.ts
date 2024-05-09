import 'dayjs';

declare module 'dayjs' {
    export type DayjsInput = ConfigType;

    export type TimeUnitTypeLongPlural = 'hours' | 'minutes' | 'seconds' | 'milliseconds';
    export type TimeUnitTypeLong = 'hour' | 'minute' | 'second' | 'millisecond';
    export type TimeUnitTypeShort = 'h' | 'm' | 's' | 'ms';
    export type TimeUnitType = TimeUnitTypeLongPlural | TimeUnitTypeLong | TimeUnitTypeShort;

    //
    // - Plugin `explicit`.
    //

    export function now(): Dayjs;
    export function from(input: DayjsInput): Dayjs;
    export function fromFormat(input: string, format: string): Dayjs;
}
