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

const getMaterialUnits = (material) => (
    'awaited_units' in material ? material.awaited_units : material.units
);

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
        if (sectionIdentifier === 'park_id' && material.is_unitary) {
            const units = getMaterialUnits(material);

            units.forEach((unit) => {
                const unitParkId = unit.park_id;
                const unitParkName = sectionNameGetter(unitParkId);

                if (!sections.has(unitParkId)) {
                    sections.set(unitParkId, {
                        id: unitParkId,
                        name: unitParkName,
                        materials: [],
                        subTotal: 0,
                    });
                }

                const section = sections.get(unitParkId);

                const sectionMaterialIndex = section.materials.findIndex((sectionMaterial) => (
                    sectionMaterial.id === material.id
                ));
                if (sectionMaterialIndex > -1) {
                    return;
                }

                const materialUnitsForPark = units.filter((_unit) => (
                    _unit.park_id === unitParkId
                ));

                const materialWithUnits = { ...material };
                if ('awaited_units' in material) {
                    materialWithUnits.awaited_units = materialUnitsForPark;
                } else {
                    materialWithUnits.units = materialUnitsForPark;
                }

                if (material.pivot) {
                    materialWithUnits.pivot = {
                        ...material.pivot,
                        quantity: materialUnitsForPark.length,
                        units: materialUnitsForPark.map((_unit) => _unit.id),
                    };
                }

                if ('awaited_units' in material) {
                    materialWithUnits.awaited_quantity = materialUnitsForPark.length;
                }

                section.materials.push(materialWithUnits);

                const quantity = materialUnitsForPark.length;
                section.subTotal += (quantity * material.rental_price);
            });

            return;
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
        section.subTotal += quantity * material.rental_price;
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

            return _a < _b ? -1 : 1;
        });
    });

    return result;
};

export default dispatchMaterialInSections;
