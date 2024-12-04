import isMateriaInParks from '../isMaterialInParks';
import data from '@fixtures/materials';

import type { MaterialWithAvailability } from '@/stores/api/materials';

describe('MaterialsSelector / Utils / isMateriaInParks()', () => {
    it('should return wether a material is present in the given parks or not', () => {
        const material: MaterialWithAvailability = data.withAvailability(1);
        expect(isMateriaInParks(material, [1])).toBe(true);
        expect(isMateriaInParks(material, [2])).toBe(false);
        expect(isMateriaInParks(material, [1, 2])).toBe(true);
    });
});
