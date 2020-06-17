import Config from '@/config/globalConfig';

const getEventGrandTotal = (total, daysCount) => {
  if (typeof total !== 'number' || Number.isNaN(total)) {
    return 0;
  }
  if (total === 0 || daysCount === 0) {
    return 0;
  }

  const ratio = Config.degressiveRate(daysCount);
  return total * ratio;
};

export default getEventGrandTotal;
