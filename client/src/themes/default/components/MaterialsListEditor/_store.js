import Vuex from 'vuex';

export default new Vuex.Store({
    state: {
        materials: {},
    },
    mutations: {
        init(state, materials) {
            const reducer = (acc, material) => {
                const { quantity } = material.pivot;
                return { ...acc, [material.id]: { quantity } };
            };
            state.materials = materials.reduce(reducer, {});
        },

        setQuantity(state, payload) {
            const { material, quantity } = payload;
            const { id } = material;

            if (!state.materials[id]) {
                state.materials = {
                    ...state.materials,
                    [id]: { quantity: 0 },
                };
            }

            state.materials[id].quantity = quantity;
        },
    },
    getters: {
        getQuantity: (state) => (id) => (
            state.materials[id]?.quantity || 0
        ),
    },
});
