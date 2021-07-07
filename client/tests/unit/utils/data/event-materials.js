import materials from './materials';

export default [
  { ...materials[0], pivot: { quantity: 1 } },
  { ...materials[1], pivot: { quantity: 2 } },
  { ...materials[2], pivot: { quantity: 1 } },
  { ...materials[3], pivot: { quantity: 3 } },
  { ...materials[4], pivot: { quantity: 3, units: [1, 2, 3] } },
];
