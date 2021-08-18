const getEventDiscountRate = (event, defaultValue = 0) => {
    const [lastBill] = event.bills ?? [];
    if (lastBill) {
        return lastBill.discount_rate;
    }

    const [lastEstimate] = event.estimates ?? [];
    if (lastEstimate) {
        return lastEstimate.discount_rate;
    }

    return defaultValue;
};

export default getEventDiscountRate;
