import Period from '@/utils/period';

import type Day from '@/utils/day';

import type { RawDateSnippet, RawRangeSnippet } from '../_types';

export const DATE_SNIPPETS: RawDateSnippet[][] = [
    [
        {
            labelKey: 'predefined-period.today',
            period: (today: Day): Day => today,
        },
        {
            labelKey: 'predefined-period.tomorrow',
            period: (today: Day): Day => (
                today.addDay()
            ),
        },
        {
            labelKey: 'predefined-period.yesterday',
            period: (today: Day): Day => (
                today.subDay()
            ),
        },
    ],
];

export const RANGE_SNIPPETS: RawRangeSnippet[][] = [
    [
        {
            labelKey: 'predefined-period.this-week',
            period: (today: Day): Period<true> => (
                new Period(today.startOfWeek(), today.endOfWeek(), true)
            ),
        },
        {
            labelKey: 'predefined-period.this-month',
            period: (today: Day): Period<true> => (
                new Period(today.startOfMonth(), today.endOfMonth(), true)
            ),
        },
        {
            labelKey: 'predefined-period.this-year',
            period: (today: Day): Period<true> => (
                new Period(today.startOfYear(), today.endOfYear(), true)
            ),
        },
    ],
    [
        {
            labelKey: 'predefined-period.next-week',
            period: (today: Day): Period<true> => {
                const nextWeek = today.addWeek();
                return new Period(
                    nextWeek.startOfWeek(),
                    nextWeek.endOfWeek(),
                    true,
                );
            },
        },
        {
            labelKey: 'predefined-period.next-month',
            period: (today: Day): Period<true> => {
                const nextMonth = today.addMonth();
                return new Period(
                    nextMonth.startOfMonth(),
                    nextMonth.endOfMonth(),
                    true,
                );
            },
        },
        {
            labelKey: 'predefined-period.next-year',
            period: (today: Day): Period<true> => {
                const nextYear = today.addYear();
                return new Period(
                    nextYear.startOfYear(),
                    nextYear.endOfYear(),
                    true,
                );
            },
        },
    ],
    [
        {
            labelKey: 'predefined-period.last-week',
            period: (today: Day): Period<true> => {
                const lastWeek = today.subWeek();
                return new Period(
                    lastWeek.startOfWeek(),
                    lastWeek.endOfWeek(),
                    true,
                );
            },
        },
        {
            labelKey: 'predefined-period.last-month',
            period: (today: Day): Period<true> => {
                const lastMonth = today.subMonth();
                return new Period(
                    lastMonth.startOfMonth(),
                    lastMonth.endOfMonth(),
                    true,
                );
            },
        },
        {
            labelKey: 'predefined-period.last-year',
            period: (today: Day): Period<true> => {
                const lastYear = today.subYear();
                return new Period(
                    lastYear.startOfYear(),
                    lastYear.endOfYear(),
                    true,
                );
            },
        },
    ],
    [
        {
            labelKey: 'predefined-period.next-30days',
            period: (today: Day): Period<true> => (
                new Period(today.addDay(), today.addDay(30), true)
            ),
        },
        {
            labelKey: 'predefined-period.next-90days',
            period: (today: Day): Period<true> => (
                new Period(today.addDay(), today.addDay(90), true)
            ),
        },
        {
            labelKey: 'predefined-period.next-365days',
            period: (today: Day): Period<true> => (
                new Period(today.addDay(), today.addDay(365), true)
            ),
        },
    ],
    [
        {
            labelKey: 'predefined-period.last-30days',
            period: (today: Day): Period<true> => (
                new Period(today.subDay(30), today.subDay(1), true)
            ),
        },
        {
            labelKey: 'predefined-period.last-90days',
            period: (today: Day): Period<true> => (
                new Period(today.subDay(90), today.subDay(1), true)
            ),
        },
        {
            labelKey: 'predefined-period.last-365days',
            period: (today: Day): Period<true> => (
                new Period(today.subDay(365), today.subDay(1), true)
            ),
        },
    ],
];
