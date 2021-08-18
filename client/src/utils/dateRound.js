import moment from 'moment';

const dateRound = (date, minutesStep = 15) => {
    const result = new Date(date);
    const minutes = date.getMinutes();

    if ([0, 15, 30, 45].includes(minutes)) {
        return result;
    }

    const roundedMinutes = (Math.round(minutes / minutesStep) * minutesStep) % 60;
    result.setMinutes(roundedMinutes);

    const nextHourThreshold = 60 - (minutesStep / 2);
    if (minutes < nextHourThreshold) {
        return result;
    }

    const hours = date.getHours();
    if (hours === 23) {
        return moment(result).add(1, 'day').startOf('day').toDate();
    }

    result.setHours(hours + 1);
    return result;
};

export default dateRound;
