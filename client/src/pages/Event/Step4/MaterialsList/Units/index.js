import Unit from './Unit/Unit.vue';

export default {
  name: 'MaterialsListUnits',
  components: { Unit },
  props: {
    event: Object,
    material: Object,
    filters: Object,
  },
  data() {
    const initialMaterial = this.event.materials?.find(({ id }) => id === this.material.id);
    const initialUnits = initialMaterial ? [...initialMaterial.pivot.units] : [];
    return {
      initialUnits,
      withUnavailable: false,
    };
  },
  watch: {
    event(newEvent) {
      const newMaterial = newEvent.materials?.find(({ id }) => id === this.material.id);
      if (!newMaterial) {
        return;
      }

      const newUnits = [...newMaterial.pivot.units]
        .filter((unitId) => !this.initialUnits.includes(unitId));

      this.initialUnits.push(...newUnits);
    },
  },
  computed: {
    selected() {
      return this.$store.getters.getUnits(this.material.id);
    },

    units() {
      return this.material.units.filter((unit) => {
        if (this.initialUnits.includes(unit.id)) {
          return true;
        }

        if (this.filters.park && unit.park_id !== this.filters.park) {
          return false;
        }

        return this.withUnavailable || (unit.is_available && !unit.is_broken);
      });
    },
  },
  methods: {
    handleToggleUnit(id) {
      this.$store.commit('toggleUnit', { material: this.material, unitId: id });
      this.$emit('change');
    },

    toggleWithUnavailable(e) {
      e.preventDefault();
      e.stopPropagation();
      this.withUnavailable = !this.withUnavailable;
    },
  },
};
