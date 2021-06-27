import './index.scss';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';
import observeBarcodeScan from '@/utils/observeBarcodeScan';
import invariant from 'invariant';
import { normalizeUnitsQuantities } from './_utils';
import Item from './Item';

const Inventory = {
  name: 'Inventory',
  props: {
    materials: { type: Array, required: true },
    quantities: { type: Array, required: true },
    errors: { type: Array, default: () => [] },
    locked: { type: Boolean, default: false },
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

    this.cancelScanObservation = observeBarcodeScan(this.handleScan);
  },
  beforeDestroy() {
    if (this.cancelScanObservation) {
      this.cancelScanObservation();
    }
  },
  methods: {
    handleChange(id, quantities) {
      if (this.locked) {
        return;
      }
      this.$emit('change', id, quantities);
    },
    handleScan(id, unitId) {
      if (!id || !unitId) {
        return;
      }

      const material = this.materials.find((_material) => _material.id === id);
      if (!material || !material.is_unitary) {
        return;
      }

      const awaitedUnits = material?.awaited_units ?? [];
      if (awaitedUnits.length === 0) {
        return;
      }

      if (!awaitedUnits.find((_unit) => _unit.id === unitId)) {
        return;
      }

      const quantities = this.getMaterialQuantities(id);
      const index = quantities.units.findIndex((unit) => unit.id === unitId);
      if (index < 0) {
        return;
      }

      if (!this.locked && quantities.units[index].isLost) {
        quantities.actual += 1;
        quantities.units[index].isLost = false;
        this.$emit('change', id, quantities);
      }

      const ref = this.$refs[`items[${id}]`];
      if (ref) {
        ref.scrollIntoView();
      }
    },
    getMaterialQuantities(materialId) {
      const material = this.materials.find((_material) => _material.id === materialId);
      invariant(material, "Le matériel demandé ne fait pas partie du matériel de l'inventaire.");

      const quantities = this.quantities.find(({ id }) => id === materialId);
      return {
        actual: quantities?.actual ?? 0,
        broken: quantities?.broken ?? 0,
        units: [...normalizeUnitsQuantities(material, quantities?.units)],
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
