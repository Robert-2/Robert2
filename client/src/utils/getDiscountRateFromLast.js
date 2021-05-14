const getDiscountRateFromLast = (lastBill, lastEstimate = null, previousValue = 0) => {
  if (lastBill) {
    return lastBill.discount_rate;
  }

  if (lastEstimate) {
    return lastEstimate.discount_rate;
  }

  return previousValue;
};

export default getDiscountRateFromLast;
