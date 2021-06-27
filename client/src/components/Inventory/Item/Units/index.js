import './index.scss';
import Item from './Item';

const InventoryItemUnits = {
  name: 'InventoryItemUnits',
  props: {
    material: { type: Object, required: true },
    quantities: { type: Object, required: true },
    locked: { type: Boolean, default: false },
    strict: { type: Boolean, default: false },
  },
  computed: {
    id() {
      return this.material.id;
    },

    awaitedUnits() {
      return this.material.awaited_units ?? [];
    },

    units() {
      return this.quantities.units ?? [];
    },
  },
  methods: {
    getValues(unitId) {
      const values = this.units.find(({ id }) => id === unitId);
      return values ?? { id: unitId, isLost: true, isBroken: false };
    },

    handleChange(id, values) {
      if (this.locked) {
        return;
      }

      let { actual = 0, broken = 0 } = this.quantities;

      const units = this.awaitedUnits.map((unit) => {
        const prevValues = this.getValues(unit.id);
        if (unit.id !== id) {
          return { id: unit.id, ...prevValues };
        }

        if (prevValues.isLost !== values.isLost) {
          actual += values.isLost ? -1 : 1;
        }

        if (prevValues.isBroken !== values.isBroken) {
          broken += !values.isBroken ? -1 : 1;
        }

        return { id: unit.id, ...values };
      });

      this.$emit('change', { actual, broken, units });
    },
  },
  render() {
    const { locked, awaitedUnits, handleChange } = this;

    return (
      <div class="InventoryItemUnits">
        <table class="InventoryItemUnits__table">
          <tbody>
            {awaitedUnits.map((unit) => (
              <Item
                key={unit.id}
                unit={unit}
                locked={locked}
                values={this.getValues(unit.id)}
                onChange={handleChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

export default InventoryItemUnits;
