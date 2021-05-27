const dispatchMaterialInSections = (
  materials,
  sectionIdentifier,
  sectionNameGetter,
  sortBy = 'name',
) => {
  if (!materials || materials.length === 0 || !sectionNameGetter) {
    return [];
  }

  const sections = [];
  materials.forEach((material) => {
    if (!Object.prototype.hasOwnProperty.call(material, sectionIdentifier)) {
      throw new Error(`Identifier '${sectionIdentifier}' doesn't exist in material data.`);
    }

    const sectionId = material[sectionIdentifier];
    const { rental_price: price, pivot } = material;
    let sectionIndex = sections.findIndex(
      (section) => section.id === sectionId,
    );

    if (sectionIndex < 0) {
      const sectionName = sectionNameGetter(sectionId);
      sections.push({ id: sectionId, name: sectionName });
      sectionIndex = sections.length - 1;
    }

    const { quantity } = pivot;

    if (sections[sectionIndex].materials) {
      sections[sectionIndex].materials.push(material);
      sections[sectionIndex].subTotal += (quantity * price);
    } else {
      sections[sectionIndex].materials = [material];
      sections[sectionIndex].subTotal = (quantity * price);
    }
  });

  sections.forEach((section) => {
    if (sortBy === 'price') {
      section.materials.sort((a, b) => {
        const subtotalA = a.rental_price * a.pivot.quantity;
        const subtotalB = b.rental_price * b.pivot.quantity;
        return subtotalA > subtotalB ? -1 : 1;
      });
    } else {
      section.materials.sort((a, b) => {
        const textA = a[sortBy];
        const textB = b[sortBy];
        if (textA === textB) return 0;
        return (textA < textB) ? -1 : 1;
      });
    }
  });

  return sections;
};

export default dispatchMaterialInSections;
