const getEventOneDayTotal = (materials) => {
    if (!materials || materials.length === 0) {
        return 0;
    }

    return materials.reduce((total, material) => (
        total + (material.rental_price * material.pivot.quantity)
    ), 0);
};

export default getEventOneDayTotal;
