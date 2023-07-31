import materials from '@fixtures/materials';
import setQuantity from '../../mutations/setQuantity';

import type { State } from '../../_types';
import type { MaterialWithAvailabilities } from '@/stores/api/materials';

describe('MaterialsSelector / Store / setQuantity()', () => {
    const createState = (_materials: State['materials']): State => ({
        materials: _materials,
    });

    it('should throw if the quantity is negative', () => {
        const state = createState({});
        const material: MaterialWithAvailabilities = {
            ...materials[0],
            available_quantity: 1,
        };
        expect(() => { setQuantity(state, { material, quantity: -1 }); })
            .toThrow('Invalid quantity, should be positive.');
    });

    it('should add a new material with specified quantity (not unitary)', () => {
        const material: MaterialWithAvailabilities = {
            ...materials[0],
            available_quantity: 1,
        };

        const state1 = createState({});
        setQuantity(state1, { material, quantity: 5 });
        expect(state1.materials).toEqual({
            '31': { quantity: 5 },
        });
    });

    it('should do nothing if there is no changes in quantities', () => {
        const material: MaterialWithAvailabilities = {
            ...materials[0],
            available_quantity: 1,
        };

        const state1 = createState({});
        setQuantity(state1, { material, quantity: 5 });
        setQuantity(state1, { material, quantity: 5 });
        setQuantity(state1, { material, quantity: 5 });
        expect(state1.materials).toEqual({
            '31': { quantity: 5 },
        });
    });

    it('should modify the specified quantity (and not "incrementing" it) (not unitary)', () => {
        const material: MaterialWithAvailabilities = {
            ...materials[0],
            available_quantity: 1,
        };

        const state1 = createState({});
        setQuantity(state1, { material, quantity: 5 });
        setQuantity(state1, { material, quantity: 3 });
        expect(state1.materials).toEqual({
            '31': { quantity: 3 },
        });
    });
});
