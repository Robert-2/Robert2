import moment from 'moment';
import { Type } from './_types';

import type { Moment } from 'moment';
import type {
    LooseValue,
    DateValue,
    Value,
    LooseDateValue,
    RawDateSnippet,
    RawRangeSnippet,
} from './_types';

/** Pas entres les minutes sélectionnable dans le datepicker. */
export const MINUTES_STEP = 15;

export const DATE_SNIPPETS: RawDateSnippet[][] = [
    [
        {
            labelKey: 'predefined-period.today',
            period: (now: Moment) => (
                now.clone()
            ),
        },
        {
            labelKey: 'predefined-period.tomorrow',
            period: (now: Moment) => (
                now.clone().add(1, 'days')
            ),
        },
        {
            labelKey: 'predefined-period.yesterday',
            period: (now: Moment) => (
                now.clone().subtract(1, 'days')
            ),
        },
    ],
];

export const RANGE_SNIPPETS: RawRangeSnippet[][] = [
    [
        {
            labelKey: 'predefined-period.this-week',
            period: (now: Moment) => [
                now.clone().startOf('week'),
                now.clone().endOf('week'),
            ],
        },
        {
            labelKey: 'predefined-period.this-month',
            period: (now: Moment) => [
                now.clone().startOf('month'),
                now.clone().endOf('month'),
            ],
        },
        {
            labelKey: 'predefined-period.this-year',
            period: (now: Moment) => [
                now.clone().startOf('year'),
                now.clone().endOf('year'),
            ],
        },
    ],
    [
        {
            labelKey: 'predefined-period.next-week',
            period: (now: Moment) => {
                const nextWeek = now.clone().add(1, 'weeks');
                return [
                    nextWeek.clone().startOf('week'),
                    nextWeek.clone().endOf('week'),
                ];
            },
        },
        {
            labelKey: 'predefined-period.next-month',
            period: (now: Moment) => {
                const nextMonth = now.clone().add(1, 'months');
                return [
                    nextMonth.clone().startOf('month'),
                    nextMonth.clone().endOf('month'),
                ];
            },
        },
        {
            labelKey: 'predefined-period.next-year',
            period: (now: Moment) => {
                const nextYear = now.clone().add(1, 'years');
                return [
                    nextYear.clone().startOf('year'),
                    nextYear.clone().endOf('year'),
                ];
            },
        },
    ],
    [
        {
            labelKey: 'predefined-period.last-week',
            period: (now: Moment) => {
                const lastWeek = now.clone().subtract(1, 'weeks');
                return [
                    lastWeek.clone().startOf('week'),
                    lastWeek.clone().endOf('week'),
                ];
            },
        },
        {
            labelKey: 'predefined-period.last-month',
            period: (now: Moment) => {
                const lastMonth = now.clone().subtract(1, 'months');
                return [
                    lastMonth.clone().startOf('month'),
                    lastMonth.clone().endOf('month'),
                ];
            },
        },
        {
            labelKey: 'predefined-period.last-year',
            period: (now: Moment) => {
                const lastYear = now.clone().subtract(1, 'years');
                return [
                    lastYear.clone().startOf('year'),
                    lastYear.clone().endOf('year'),
                ];
            },
        },
    ],
    [
        {
            labelKey: 'predefined-period.next-30days',
            period: (now: Moment) => [
                now.clone().add(1, 'days'),
                now.clone().add(30, 'days'),
            ],
        },
        {
            labelKey: 'predefined-period.next-90days',
            period: (now: Moment) => [
                now.clone().add(1, 'days'),
                now.clone().add(90, 'days'),
            ],
        },
        {
            labelKey: 'predefined-period.next-365days',
            period: (now: Moment) => [
                now.clone().add(1, 'days'),
                now.clone().add(365, 'days'),
            ],
        },
    ],
    [
        {
            labelKey: 'predefined-period.last-30days',
            period: (now: Moment) => [
                now.clone().subtract(30, 'days'),
                now.clone().subtract(1, 'days'),
            ],
        },
        {
            labelKey: 'predefined-period.last-90days',
            period: (now: Moment) => [
                now.clone().subtract(90, 'days'),
                now.clone().subtract(1, 'days'),
            ],
        },
        {
            labelKey: 'predefined-period.last-365days',
            period: (now: Moment) => [
                now.clone().subtract(365, 'days'),
                now.clone().subtract(1, 'days'),
            ],
        },
    ],
];

const formatSingleValue = (rawValue: LooseDateValue, type: Type, withoutMinutes: boolean, isEnd: boolean = false): DateValue => {
    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    const valueMoment = moment(rawValue);
    if (!valueMoment.isValid()) {
        return null;
    }

    if (type === Type.DATETIME) {
        // - Si la partie "heure" n'a pas été passée, on la déduit.
        const creationFormat = valueMoment.creationData().format;
        if (creationFormat === 'YYYY-MM-DD') {
            if (isEnd) {
                if (withoutMinutes) {
                    valueMoment.set({ hour: 23, minute: 0, second: 0 });
                } else {
                    const lastStepMinute = (((60 / MINUTES_STEP) - 1) * MINUTES_STEP);
                    valueMoment.set({ hour: 23, minute: lastStepMinute, second: 0 });
                }
            } else {
                valueMoment.startOf('day');
            }
        }

        // - On arrondi à la précision désirée.
        valueMoment.set('seconds', Math.round(valueMoment.second() / 60) * 60);
        if (withoutMinutes) {
            valueMoment
                .set('minutes', Math.round(valueMoment.minute() / 60) * 60)
                .startOf('hours');
        } else {
            valueMoment
                .set('minutes', Math.round(valueMoment.minute() / MINUTES_STEP) * MINUTES_STEP)
                .startOf('minutes');
        }
    }

    return type === Type.DATETIME
        ? valueMoment.format('YYYY-MM-DD HH:mm:ss')
        : valueMoment.format('YYYY-MM-DD');
};

export const normalizeValue = (looseValue: LooseValue, type: Type, isRange: boolean, withoutMinutes: boolean): Value => {
    if (!isRange) {
        const normalizedLooseValue: LooseValue<false> = Array.isArray(looseValue)
            ? [...looseValue].shift()
            : looseValue;

        return formatSingleValue(normalizedLooseValue, type, withoutMinutes);
    }

    const [looseStart, looseEnd] = !Array.isArray(looseValue)
        ? ([looseValue, looseValue] as [start: LooseDateValue, end: LooseDateValue])
        : looseValue;

    const normalizedStart = formatSingleValue(looseStart, type, withoutMinutes, false);
    const normalizedEnd = formatSingleValue(looseEnd, type, withoutMinutes, true);

    return normalizedStart !== null && normalizedEnd !== null
        ? [normalizedStart, normalizedEnd]
        : [null, null];
};
