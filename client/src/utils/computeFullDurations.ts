import moment from 'moment';

import type { Moment, MomentInput } from 'moment';

export type Duration = {
    days: number,
    hours: number,
};

const computeFullDurationsDays = (startDate: Moment, endDate: Moment): number => {
    startDate = startDate.clone().startOf('day');
    endDate = endDate.clone();

    const needsDayAdjustment = (
        endDate.creationData().format === 'YYYY-MM-DD' ||
        endDate.format('HH:mm:ss') !== '00:00:00'
    );
    if (needsDayAdjustment) {
        endDate = endDate.add(1, 'day').startOf('day');
    }

    return Math.max(endDate.diff(startDate, 'days'), 1);
};

const computeFullDurationsHours = (startDate: Moment, endDate: Moment): number => {
    startDate = startDate.clone().startOf('hour');
    endDate = endDate.clone();

    const needsDayAdjustment = (
        endDate.creationData().format === 'YYYY-MM-DD' ||
        endDate.format('mm:ss') !== '00:00'
    );
    if (needsDayAdjustment) {
        endDate = endDate.add(1, 'hour').startOf('hour');
    }

    return Math.max(endDate.diff(startDate, 'hours'), 1);
};

const computeFullDurations = (startDate: MomentInput, endDate: MomentInput): Duration => {
    startDate = moment(startDate);
    endDate = moment(endDate);

    return {
        days: computeFullDurationsDays(startDate, endDate),
        hours: computeFullDurationsHours(startDate, endDate),
    };
};

export default computeFullDurations;
