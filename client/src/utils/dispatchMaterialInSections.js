const getMaterialQuantity = (material) => {
  if ('awaited_quantity' in material) {
    return material.awaited_quantity;
  }

  return (
    'quantity' in (material.pivot ?? {})
      ? material.pivot.quantity
      : material.stock_quantity
  );
};

const compareString = (a, b) => (
  a.localeCompare(b, undefined, {
    ignorePunctuation: true,
    sensitivity: 'base',
  })
);

const dispatchMaterialInSections = (
  materials,
  sectionIdentifier,
  sectionNameGetter,
  sortBy = 'name',
) => {
  if (!materials || materials.length === 0 || !sectionNameGetter) {
    return [];
  }

  const sections = new Map();
  materials.forEach((material) => {
    if (!Object.prototype.hasOwnProperty.call(material, sectionIdentifier)) {
      throw new Error(`Identifier '${sectionIdentifier}' doesn't exist in material data.`);
    }

    const sectionId = material[sectionIdentifier];
    if (!sections.has(sectionId)) {
      const sectionName = sectionNameGetter(sectionId);
      sections.set(sectionId, {
        id: sectionId,
        name: sectionName,
        materials: [],
        subTotal: 0,
      });
    }

    const section = sections.get(sectionId);
    const quantity = getMaterialQuantity(material);

    section.materials.push(material);
    section.subTotal += (quantity * material.rental_price);
  });

  const result = Array.from(sections.values());
  result.sort((a, b) => compareString(a.name ?? '', b.name ?? ''));

  result.forEach((section) => {
    section.materials.sort((a, b) => {
      if (sortBy === 'price') {
        const subtotalA = a.rental_price * getMaterialQuantity(a);
        const subtotalB = b.rental_price * getMaterialQuantity(b);
        return subtotalA > subtotalB ? -1 : 1;
      }

      if (sortBy === 'name') {
        return compareString(a.name, b.name);
      }

      const _a = a[sortBy];
      const _b = b[sortBy];

      if (_a === _b) {
        return 0;
      }

      return (_a < _b) ? -1 : 1;
    });
  });

  return result;
};

export default dispatchMaterialInSections;
