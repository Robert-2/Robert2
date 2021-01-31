import store from '@/store';
import Alert from '@/components/Alert';

export default {
  name: 'MaterialViewUnits',
  props: {
    material: { required: true, type: Object },
  },
  data() {
    return {
      deleteRequests: new Map(),
      columns: [
        'serial_number',
        'park',
        'is_broken',
        'actions',
      ],
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'serial_number', ascending: true },
        sortable: [
          'serial_number',
          'is_broken',
        ],
        headings: {
          serial_number: this.$t('serial-number'),
          park: this.$t('park'),
          is_broken: this.$t('is-broken'),
          actions: '',
        },
      },
    };
  },
  mounted() {
    store.dispatch('parks/fetch');
  },
  methods: {
    getParkName(parkId) {
      return store.getters['parks/parkName'](parkId);
    },

    async deleteUnit(unitId) {
      const { value: hasConfirmed } = await Alert.ConfirmDelete(this.$t, 'material-units', false);
      if (!hasConfirmed) {
        return;
      }

      if (this.deleteRequests.has(unitId)) {
        await this.deleteRequests.get(unitId);
        return;
      }

      try {
        this.deleteRequests.set(unitId, this.$http.delete(`material-units/${unitId}`));
        await this.deleteRequests.get(unitId);
        this.$emit('outdated');
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.deleteRequests.delete(unitId);
      }
    },
  },
};
