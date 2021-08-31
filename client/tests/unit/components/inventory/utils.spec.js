import { normalizeUnitsQuantities } from '@/components/Inventory/_utils';
import materials from '../../utils/data/materials';

describe('components/Inventory/utils.normalizeUnitsQuantities', () => {
    const material = materials[4];
    const units = [
        { id: 1, isLost: false, isBroken: false },
        { id: 2, isLost: true, isBroken: false },
        { id: 3, isLost: true, isBroken: true },
    ];

    test('Retourne un tableau vide quand le matériel a aucune unités attendue', () => {
        const result = normalizeUnitsQuantities(material, units);
        expect(result).toStrictEqual([]);
    });

    const materialWithAwaitedUnits = {
        ...material,
        awaited_units: [{ id: 1 }, { id: 2 }, { id: 3 }],
    };

    test('Retourne la liste des unités normalisée quand aucune unité attendue', () => {
        const result = normalizeUnitsQuantities(materialWithAwaitedUnits, []);
        expect(result).toEqual([
            { id: 1, isLost: true, isBroken: false },
            { id: 2, isLost: true, isBroken: false },
            { id: 3, isLost: true, isBroken: false },
        ]);
    });

    test('Retourne la liste des unités normalisée avec celles attendues', () => {
        const result = normalizeUnitsQuantities(materialWithAwaitedUnits, units);
        expect(result).toEqual([
            { id: 1, isLost: false, isBroken: false },
            { id: 2, isLost: true, isBroken: false },
            { id: 3, isLost: false, isBroken: true },
        ]);
    });
});
