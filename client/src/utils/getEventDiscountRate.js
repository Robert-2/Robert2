const getEventDiscountRate = (event, defaultValue = 0) => {
    const [lastInvoice] = event.invoices ?? [];
    if (lastInvoice) {
        return lastInvoice.discount_rate;
    }

    const [lastEstimate] = event.estimates ?? [];
    if (lastEstimate) {
        return lastEstimate.discount_rate;
    }

    return defaultValue;
};

export default getEventDiscountRate;
