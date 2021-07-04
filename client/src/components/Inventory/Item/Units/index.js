import './index.scss';
import invariant from 'invariant';
import Item from './Item';

const InventoryItemUnits = {
  name: 'InventoryItemUnits',
  props: {
    material: { type: Object, required: true },
    quantities: { type: Object, required: true },
    locked: { type: [Boolean, Array], default: false },
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
      const originalValues = this.awaitedUnits.find(({ id }) => id === unitId);
      invariant(originalValues, "L'unité demandée ne fait pas partie du matériel de l'inventaire.");
      const originalState = originalValues.state;

      const existingValues = this.units.find(({ id }) => id === unitId);
      if (!existingValues) {
        return {
          id: unitId,
          state: originalState,
          isLost: true,
          isBroken: false,
        };
      }

      const isBroken = existingValues.isBroken ?? false;
      const isLost = isBroken ? false : (existingValues.isLost ?? true);
      const state = isLost ? originalState : (existingValues.state ?? originalState);

      return { id: unitId, state, isLost, isBroken };
    },

    handleChange(id, values) {
      if (this.locked === true) {
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

        // - Si les états des unités sont lockés, on force la précédente valeur.
        // eslint-disable-next-line prefer-destructuring
        const state = (this.locked !== 'unit-state' ? values : prevValues).state;

        return { id: unit.id, ...values, state };
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
