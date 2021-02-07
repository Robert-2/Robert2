import Unit from './Unit/Unit.vue';
import store from '../MaterialsStore';

export default {
  name: 'MaterialsListUnits',
  components: { Unit },
  props: {
    event: Object,
    material: Object,
  },
  data() {
    const initialMaterial = this.event.materials?.find(({ id }) => id === this.material.id);
    const initialUnits = initialMaterial ? [...initialMaterial.pivot.units] : [];
    return { initialUnits };
  },
  computed: {
    selected() {
      return store.getters.getUnits(this.material.id);
    },
    units() {
      // eslint-disable-next-line prefer-destructuring
      const initialUnits = this.initialUnits;

      return this.material.units.filter((unit) => {
        if (initialUnits.includes(unit.id)) {
          return true;
        }
        return unit.is_available && !unit.is_broken;
      });
    },
  },
  methods: {
    handleToggleUnit(id) {
      store.commit('toggleUnit', { material: this.material, unitId: id });
      this.$emit('change');
    },
  },
};
