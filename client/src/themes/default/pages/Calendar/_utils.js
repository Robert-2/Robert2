/* eslint-disable import/prefer-default-export */

import moment from 'moment';

export const getDefaultPeriod = () => {
    let start = moment(localStorage.getItem('calendarStart'), 'YYYY-MM-DD HH:mm:ss');
    let end = moment(localStorage.getItem('calendarEnd'), 'YYYY-MM-DD HH:mm:ss');

    if (!start.isValid() || !end.isValid()) {
        start = moment().subtract(2, 'days').startOf('day');
        end = moment().add(5, 'days').endOf('day');
    }

    return { start, end };
};
