const dispatchMaterialInCategories = (materials, categoryNameGetter) => {
  if (!materials || materials.length === 0 || !categoryNameGetter) {
    return [];
  }

  const categories = [];
  materials.forEach((material) => {
    const { category_id: categoryId, rental_price: price, pivot } = material;
    let categoryIndex = categories.findIndex(
      (categ) => categ.id === categoryId,
    );

    if (categoryIndex < 0) {
      const categoryName = categoryNameGetter(categoryId);
      categories.push({ id: categoryId, name: categoryName });
      categoryIndex = categories.length - 1;
    }

    const { quantity } = pivot;

    if (categories[categoryIndex].materials) {
      categories[categoryIndex].materials.push(material);
      categories[categoryIndex].subTotal += (quantity * price);
    } else {
      categories[categoryIndex].materials = [material];
      categories[categoryIndex].subTotal = (quantity * price);
    }
  });

  categories.forEach((category) => {
    category.materials.sort((a, b) => {
      const subtotalA = a.rental_price * a.pivot.quantity;
      const subtotalB = b.rental_price * b.pivot.quantity;
      return subtotalA > subtotalB ? -1 : 1;
    });
  });

  return categories;
};

export default dispatchMaterialInCategories;
