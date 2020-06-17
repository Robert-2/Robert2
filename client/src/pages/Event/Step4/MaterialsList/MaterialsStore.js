import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    quantities: {},
  },
  mutations: {
    init(state, materials) {
      const quantities = {};
      materials.forEach((material) => {
        quantities[material.id] = material.pivot.quantity;
      });
      state.quantities = quantities;
    },

    setQuantity(state, { id, quantity }) {
      state.quantities[id] = quantity;

      if (!state.quantities[id]) {
        delete state.quantities[id];
      }
    },

    increment(state, id) {
      if (state.quantities[id] === undefined) {
        state.quantities[id] = 1;
      } else {
        state.quantities[id] += 1;
      }
    },

    decrement(state, id) {
      if (!state.quantities[id]) {
        return;
      }
      state.quantities[id] -= 1;
    },
  },
  getters: {
    getQuantity: (state) => (id) => (state.quantities[id] || 0),
  },
});
