import store from '@/store';
import Alert from '@/components/Alert';
import Config from '@/config/globalConfig';

export default {
  name: 'MaterialViewUnits',
  props: {
    material: { required: true, type: Object },
  },
  data() {
    return {
      deleteRequests: new Map(),
      columns: [
        'reference',
        'serial_number',
        'park',
        'is_broken',
        'actions',
      ],
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'reference', ascending: true },
        sortable: [
          'reference',
          'serial_number',
          'is_broken',
        ],
        headings: {
          reference: this.$t('reference'),
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

    getFileUrl(unitId) {
      const { baseUrl } = Config;
      return `${baseUrl}/material-units/${unitId}/barcode`;
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
