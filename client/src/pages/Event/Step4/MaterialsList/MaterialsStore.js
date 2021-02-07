import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    materials: {},
  },
  mutations: {
    init(state, materials) {
      const reducer = (acc, material) => {
        const units = [...material.pivot.units];

        let { quantity } = material.pivot;
        if (quantity < units.length) {
          quantity = units.length;
        }

        return { ...acc, [material.id]: { quantity, units } };
      };
      state.materials = materials.reduce(reducer, {});
    },

    setQuantity(state, { material, quantity }) {
      const { id } = material;

      if (quantity <= 0) {
        delete state.materials[id];
        return;
      }

      if (!state.materials[id]) {
        state.materials = {
          ...state.materials,
          [id]: { quantity: 0, units: [] },
        };
      }

      state.materials[id].quantity = quantity;
    },

    increment(state, material) {
      const { id } = material;

      if (!state.materials[id]) {
        state.materials = {
          ...state.materials,
          [id]: { quantity: 0, units: [] },
        };
      }

      state.materials[id].quantity += 1;
    },

    decrement(state, material) {
      const { id } = material;

      if (!state.materials[id]) {
        return;
      }

      if (state.materials[id].quantity === 0) {
        return;
      }

      state.materials[id].quantity -= 1;

    toggleUnit(state, payload) {
      const { material, unitId } = payload;
      const { id } = material;

      if (!material.is_unitary) {
        throw new Error("Le matériel n'est pas unitaire, impossible d'ajouter une unité.");
      }

      if (!state.materials[id]) {
        state.materials = {
          ...state.materials,
          [id]: { quantity: 0, units: [] },
        };
      }

      if (state.materials[id].units.includes(unitId)) {
        state.materials[id].quantity -= 1;
        state.materials[id].units = state.materials[id].units.filter((_id) => _id !== unitId);
        return;
      }

      state.materials[id].quantity += 1;
      state.materials[id].units.push(unitId);
    },
  },
  getters: {
    getQuantity: (state) => (id) => (state.materials[id]?.quantity || 0),
    getUnits: (state) => (id) => (state.materials[id]?.units || []),
  },
});
