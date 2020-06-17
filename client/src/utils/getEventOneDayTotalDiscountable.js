const getEventOneDayTotalDiscountable = (materials) => {
  if (!materials || materials.length === 0) {
    return 0;
  }

  return materials.reduce((total, material) => {
    if (!material.is_discountable) {
      return total;
    }
    return total + (material.rental_price * material.pivot.quantity);
  }, 0);
};

export default getEventOneDayTotalDiscountable;
