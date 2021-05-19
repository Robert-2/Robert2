import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import materials from './data/materials';

const sectionNameGetter = (id) => {
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

describe('dispatchMaterialInSections', () => {
  test('returns an empty array with empty values', () => {
    expect(dispatchMaterialInSections()).toEqual([]);
    expect(dispatchMaterialInSections(null)).toEqual([]);
    expect(dispatchMaterialInSections(null, null)).toEqual([]);
    expect(dispatchMaterialInSections(null, null, null)).toEqual([]);
    expect(dispatchMaterialInSections([], null, null)).toEqual([]);
    expect(dispatchMaterialInSections(null, null, sectionNameGetter)).toEqual([]);
    expect(dispatchMaterialInSections([], null, sectionNameGetter)).toEqual([]);
  });

  test('dispatch a list of materials by parks, sorted by name', () => {
    const result = dispatchMaterialInSections(materials, 'park_id', sectionNameGetter);
    expect(result).toEqual([
      {
        id: 1,
        name: 'one',
        subTotal: 35,
        materials: [
          {
            id: 31,
            category_id: 1,
            park_id: 1,
            rental_price: 10,
            replacement_price: 350,
            is_discountable: true,
            pivot: { quantity: 1 },
          },
          {
            id: 32,
            category_id: 1,
            park_id: 1,
            rental_price: 10,
            replacement_price: 125,
            is_discountable: true,
            pivot: { quantity: 2 },
          },
          {
            id: 33,
            category_id: 2,
            park_id: 1,
            rental_price: 5,
            replacement_price: 150,
            is_discountable: true,
            pivot: { quantity: 1 },
          },
        ],
      },
      {
        id: 2,
        name: 'two',
        subTotal: 45,
        materials: [
          {
            id: 34,
            category_id: 3,
            park_id: 2,
            rental_price: 15,
            replacement_price: 200,
            is_discountable: false,
            pivot: { quantity: 3 },
          },
        ],
      },
    ]);
  });

  test('dispatch a list of materials by categories, sorted by price', () => {
    const result = dispatchMaterialInSections(materials, 'category_id', sectionNameGetter, 'price');
    expect(result).toEqual([
      {
        id: 1,
        name: 'one',
        subTotal: 30,
        materials: [
          {
            id: 32,
            category_id: 1,
            park_id: 1,
            rental_price: 10,
            replacement_price: 125,
            is_discountable: true,
            pivot: { quantity: 2 },
          },
          {
            id: 31,
            category_id: 1,
            park_id: 1,
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
            park_id: 1,
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
            park_id: 2,
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
