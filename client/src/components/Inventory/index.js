import './index.scss';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import invariant from 'invariant';
import Item from './Item';

const Inventory = {
  name: 'Inventory',
  props: {
    materials: { type: Array, required: true },
    quantities: { type: Array, required: true },
    errors: { type: Array, default: () => [] },
    locked: { type: [Boolean, Array], default: false },
    strict: { type: Boolean, default: false },
    displayGroup: {
      default: 'categories',
      validator: (value) => (
        ['categories', 'parks', 'none'].includes(value)
      ),
    },
  },
  computed: {
    list() {
      const categoryNameGetter = this.$store.getters['categories/categoryName'];
      const parkNameGetter = this.$store.getters['parks/parkName'];

      switch (this.displayGroup) {
        case 'categories':
          return dispatchMaterialInSections(this.materials, 'category_id', categoryNameGetter);
        case 'parks':
          return dispatchMaterialInSections(this.materials, 'park_id', parkNameGetter);
        default:
          return [
            { id: 'flat', name: null, materials: this.materials },
          ];
      }
    },
  },
  mounted() {
    this.$store.dispatch('categories/fetch');
    this.$store.dispatch('parks/fetch');
  },
  methods: {
    handleChange(id, quantities) {
      if (this.locked === true) {
        return;
      }
      this.$emit('change', id, quantities);
    },
    getMaterialQuantities(materialId) {
      const material = this.materials.find((_material) => _material.id === materialId);
      invariant(material, "Le matériel demandé ne fait pas partie du matériel de l'inventaire.");

      const quantities = this.quantities.find(({ id }) => id === materialId);
      return {
        actual: quantities?.actual ?? 0,
        broken: quantities?.broken ?? 0,
      };
    },
    getError(materialId) {
      if (!this.errors) {
        return null;
      }
      return this.errors.find(({ id }) => id === materialId);
    },
  },
  render() {
    const {
      $t: __,
      list,
      locked,
      strict,
      getMaterialQuantities,
      getError,
      handleChange,
    } = this;

    return (
      <div class="Inventory">
        {list.map(({ id: sectionId, name: sectionName, materials }) => (
          <div key={sectionId} class="Inventory__section">
            <div class="Inventory__section__header">
              <h3 class="Inventory__section__title">
                {sectionId !== 'flat' ? sectionName : ''}
              </h3>
              <h3 class="Inventory__section__quantity-title">
                {__('actual-quantity')}
              </h3>
              <h3 class="Inventory__section__quantity-title">
                {__('quantity-out-of-order')}
              </h3>
            </div>
            <div class="Inventory__list">
              {materials.map((material) => (
                <Item
                  ref={`items[${material.id}]`}
                  key={material.id}
                  material={material}
                  quantities={getMaterialQuantities(material.id)}
                  error={getError(material.id)}
                  locked={locked}
                  strict={strict}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export default Inventory;
