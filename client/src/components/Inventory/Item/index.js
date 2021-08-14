import Material from './Material';

// @vue/component
const InventoryItem = {
    name: 'InventoryItem',
    props: {
        material: { type: Object, required: true },
        quantities: { type: Object, required: true },
        error: Object,
        locked: { type: [Boolean, Array], default: false },
        strict: { type: Boolean, default: false },
    },
    computed: {
        id() {
            return this.material.id;
        },
    },
    methods: {
        handleChange(quantities) {
            if (this.locked === true) {
                return;
            }
            this.$emit('change', this.id, quantities);
        },

        scrollIntoView() {
            this.$refs.container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
    },
    render() {
        const {
            material,
            error,
            locked,
            strict,
            quantities,
            handleChange,
        } = this;

        return (
            <div class="InventoryItem" ref="container">
                <Material
                    material={material}
                    quantities={quantities}
                    error={error}
                    strict={strict}
                    locked={locked === true}
                    onChange={handleChange}
                />
            </div>
        );
    },
};

export default InventoryItem;
