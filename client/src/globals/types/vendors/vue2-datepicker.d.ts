declare module 'vue2-datepicker' {
    import type { RawComponent } from 'vue';

    export type Translations = {
        days?: string[],
        months?: string[],
        yearFormat: string,
        monthFormat: string,
        monthBeforeYear: boolean,
        formatLocale: {
            months: string[],
            monthsShort: string[],
            weekdays: string[],
            weekdaysShort: string[],
            weekdaysMin: string[],
            firstDayOfWeek: number,
            firstWeekContainsDate: number,
            meridiem(h: number, _: number, isLowercase: boolean): boolean,
            meridiemParse: RegExp,
            isPM(input: string): boolean,
        },
    };

    export type Shortcuts = {
        text: string,
        onClick(): any,
    };

    export type TimePickerOptions = {
        start: string,
        step: string,
        end: string,
        format: string,
    };

    export type Formatter = {
        stringify(date: Date | null | undefined, format: string): string,
        parse(value: string | null | undefined, format: string): Date | null,
        getWeek?(value: Date, options: { firstDayOfWeek?: number, firstWeekContainsDate?: number }): number,
    };

    export type DatePickerEmit = (value: Date | [Date, Date] | null | [null, null]) => void;
    export type DatePickerSlotParams = { emit: DatePickerEmit };

    const Datepicker: RawComponent<{
        type?: 'date' | 'datetime' | 'year' | 'month' | 'time' | 'week',
        range?: boolean,
        format?: string,
        formatter?: Formatter,
        valueType?: 'date' | 'timestamp' | 'format' | string,
        defaultValue?: Date,
        lang?: Translations,
        placeholder?: string,
        editable?: boolean,
        clearable?: boolean,
        confirm?: boolean,
        confirmText?: string,
        multiple?: boolean,
        disabled?: boolean,
        disabledDate?(date: Date, currentValue: Date[]): boolean,
        disabledTime?(date: Date): boolean,
        appendToBody?: boolean,
        inline?: boolean,
        inputClass?: string,
        inputAttr?(): Record<string, any>,
        open?: boolean,
        defaultPanel?: 'year' | 'month',
        popupStyle?(): Record<string, any>,
        popupClass?: string,
        shortcuts?: Shortcuts[],
        titleFormat?: string,
        partialUpdate?: boolean,
        rangeSeparator?: string,
        showWeekNumber?: boolean,
        hourStep?: number,
        minuteStep?: number,
        secondStep?: number,
        hourOptions?: number[],
        minuteOptions?: number[],
        secondOptions?: number[],
        showHour?: boolean,
        showMinute?: boolean,
        showSecond?: boolean,
        use12h?: boolean,
        showTimeHeader?: boolean,
        timeTitleFormat?: string,
        timePickerOptions?: TimePickerOptions,
        prefixClass?: string,
        scrollDuration?: number,
    }>;

    export default Datepicker;
}

declare module 'vue2-datepicker/locale/es/fr' {
    import type { Translations } from 'vue2-datepicker';

    const translations: Translations;
    export default translations;
}
declare module 'vue2-datepicker/locale/es/en' {
    import type { Translations } from 'vue2-datepicker';

    const translations: Translations;
    export default translations;
}
