import moment from 'moment';

const isSameDate = (date1, date2) => {
  if (date1 === date2) {
    return true;
  }

  if (!date1 || !date2) {
    return false;
  }

  let momentDate1 = date1;
  if (!moment.isMoment(date1)) {
    momentDate1 = moment(date1);
  }

  let momentDate2 = date2;
  if (!moment.isMoment(date2)) {
    momentDate2 = moment(date2);
  }

  return momentDate1.isSame(momentDate2, 'day');
};

export default isSameDate;
