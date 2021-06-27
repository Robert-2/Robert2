import Material from './Material';
import Units from './Units';

const InventoryItem = {
  name: 'InventoryItem',
  props: {
    material: { type: Object, required: true },
    quantities: { type: Object, required: true },
    error: Object,
    locked: { type: Boolean, default: false },
    strict: { type: Boolean, default: false },
  },
  computed: {
    id() {
      return this.material.id;
    },
  },
  methods: {
    handleChange(quantities) {
      if (this.locked) {
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
    const { is_unitary: isUnitary } = material;

    return (
      <div class="InventoryItem" ref="container">
        <Material
          material={material}
          quantities={quantities}
          error={error}
          strict={strict}
          locked={locked}
          onChange={handleChange}
        />
        {isUnitary && (
          <Units
            material={material}
            quantities={quantities}
            locked={locked}
            onChange={handleChange}
          />
        )}
      </div>
    );
  },
};

export default InventoryItem;
