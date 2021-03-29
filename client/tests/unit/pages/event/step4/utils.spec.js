import { getMaterialsQuantities, materialsHasChanged } from '@/pages/Event/Step4/_utils';

describe('Page Event / Step 4 (material)', () => {
  describe('Utils / getMaterialsQuantities()', () => {
    it('should return an object containing the quantities related to a material', () => {
      const materials = [
        { id: 1, is_unitary: true, pivot: { quantity: 2, units: [1, 2] } },
        { id: 2, is_unitary: false, pivot: { quantity: 6 } },
        { id: 3, is_unitary: false, pivot: { quantity: 0, units: [3] } },
        { id: 4, is_unitary: false },
        { id: 5, is_unitary: true },
        { id: 6, is_unitary: true, pivot: { units: [1] } },
      ];
      expect(getMaterialsQuantities(materials)).toEqual([
        { id: 1, quantity: 2, units: [1, 2] },
        { id: 2, quantity: 6, units: [] },
        { id: 3, quantity: 0, units: [] },
        { id: 4, quantity: 0, units: [] },
        { id: 5, quantity: 0, units: [] },
        { id: 6, quantity: 0, units: [1] },
      ]);
    });
  });

  describe('Utils / materialsHasChanged()', () => {
    it('should return true if the quantity of a previously saved material has changed', () => {
      // - Test simple de changement de quantité.
      const before1 = [{ id: 1, quantity: 1, units: [] }];
      const after1 = [{ id: 1, quantity: 2, units: [] }];
      expect(materialsHasChanged(before1, after1)).toBe(true);

      // - Test de changement dans les unités.
      const before2 = [{ id: 1, quantity: 1, units: [] }];
      const after2 = [{ id: 1, quantity: 1, units: [1] }];
      expect(materialsHasChanged(before2, after2)).toBe(true);

      // - Autre test de changement dans les unités (switch).
      const before3 = [{ id: 1, quantity: 1, units: [1] }];
      const after3 = [{ id: 1, quantity: 1, units: [2] }];
      expect(materialsHasChanged(before3, after3)).toBe(true);

      // - Autre test de changement dans les unités (switch).
      const before4 = [{ id: 1, quantity: 1, units: [1, 2] }];
      const after4 = [{ id: 1, quantity: 1, units: [2] }];
      expect(materialsHasChanged(before4, after4)).toBe(true);

      // - Test de suppression
      const before5 = [{ id: 1, quantity: 1, units: [] }];
      expect(materialsHasChanged(before5, [])).toBe(true);

      // - Test avec plusieurs matériels.
      const before6 = [
        { id: 1, quantity: 1, units: [] },
        { id: 2, quantity: 1, units: [] },
      ];
      const after6 = [
        { id: 1, quantity: 1, units: [] },
        { id: 2, quantity: 3, units: [1] },
      ];
      expect(materialsHasChanged(before6, after6)).toBe(true);
    });

    it('should return true if a new material has been added', () => {
      const after = [{ id: 1, quantity: 1, units: [] }];
      expect(materialsHasChanged([], after)).toBe(true);
    });

    it('should return false if a material has been added with a quantity of 0', () => {
      const after = [{ id: 1, quantity: 0, units: [] }];
      expect(materialsHasChanged([], after)).toBe(false);
    });

    it('should return false if a previously saved material has not changed', () => {
      // - Test simple de changement de quantité.
      const before1 = [{ id: 1, quantity: 1, units: [] }];
      const after1 = [{ id: 1, quantity: 1, units: [] }];
      expect(materialsHasChanged(before1, after1)).toBe(false);

      // - Test de changement dans les unités.
      const before2 = [{ id: 1, quantity: 1, units: [1, 2, 3] }];
      const after2 = [{ id: 1, quantity: 1, units: [1, 2, 3] }];
      expect(materialsHasChanged(before2, after2)).toBe(false);

      // - Test de changement dans les unités.
      const before3 = [{ id: 1, quantity: 0, units: [] }];
      expect(materialsHasChanged(before3, [])).toBe(false);

      // - Test avec plusieurs matériels.
      const before4 = [
        { id: 1, quantity: 1, units: [] },
        { id: 2, quantity: 1, units: [1, 2] },
      ];
      const after4 = [
        { id: 1, quantity: 1, units: [] },
        { id: 2, quantity: 3, units: [1, 2] },
      ];
      expect(materialsHasChanged(before4, after4)).toBe(true);
    });
  });
});
