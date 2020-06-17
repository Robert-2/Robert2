import dispatchMaterialInCategories from '@/utils/dispatchMaterialInCategories';
import materials from './data/materials';

const categoryNameGetter = (id) => {
  switch (id) {
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'three';
    default:
      return null;
  }
};

describe('dispatchMaterialInCategories', () => {
  it('returns an empty array with empty values', () => {
    expect(dispatchMaterialInCategories()).toEqual([]);
    expect(dispatchMaterialInCategories(null, null)).toEqual([]);
    expect(dispatchMaterialInCategories([], null)).toEqual([]);
    expect(dispatchMaterialInCategories(null, categoryNameGetter)).toEqual([]);
    expect(dispatchMaterialInCategories([], categoryNameGetter)).toEqual([]);
  });

  it('dispatch a list of materials by categories', () => {
    const result = dispatchMaterialInCategories(materials, categoryNameGetter);
    expect(result).toEqual([
      {
        id: 1,
        name: 'one',
        subTotal: 30,
        materials: [
          {
            id: 32,
            category_id: 1,
            rental_price: 10,
            replacement_price: 125,
            is_discountable: true,
            pivot: { quantity: 2 },
          },
          {
            id: 31,
            category_id: 1,
            rental_price: 10,
            replacement_price: 350,
            is_discountable: true,
            pivot: { quantity: 1 },
          },
        ],
      },
      {
        id: 2,
        name: 'two',
        subTotal: 5,
        materials: [
          {
            id: 33,
            category_id: 2,
            rental_price: 5,
            replacement_price: 150,
            is_discountable: true,
            pivot: { quantity: 1 },
          },
        ],
      },
      {
        id: 3,
        name: 'three',
        subTotal: 45,
        materials: [
          {
            id: 34,
            category_id: 3,
            rental_price: 15,
            replacement_price: 200,
            is_discountable: false,
            pivot: { quantity: 3 },
          },
        ],
      },
    ]);
  });
});
