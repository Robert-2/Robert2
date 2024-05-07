import Day from '@/utils/day';
import Period from '@/utils/period';

export const getDefaultPeriod = (): Period => {
    const savedPeriod = localStorage.getItem('calendarPeriod');
    if (savedPeriod !== null) {
        try {
            return Period.fromSerialized(JSON.parse(savedPeriod));
        } catch {
            // -
        }
    }

    return new Period(
        Day.today().subDay(3),
        Day.today().addDay(3),
        true,
    );
};

export const getCenterDateFromPeriod = (period: Period): Day => {
    const normalizedPeriod = period.setFullDays(false);
    const duration = normalizedPeriod.end.diff(normalizedPeriod.start, 'hour');
    return new Day(normalizedPeriod.start.add(duration / 2, 'hours'));
};
