import moment from 'moment';
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
        'owner',
        'is_broken',
        'is_lost',
        'state',
        'purchase_date',
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
          'state',
          'purchase_date',
          'is_lost',
        ],
        headings: {
          reference: this.$t('reference'),
          serial_number: this.$t('serial-number'),
          park: this.$t('park'),
          owner: this.$t('owner'),
          is_broken: this.$t('is-broken'),
          is_lost: this.$t('is-lost'),
          state: this.$t('state'),
          purchase_date: this.$t('purchase-date'),
          actions: '',
        },
      },
    };
  },
  mounted() {
    this.$store.dispatch('parks/fetch');
    this.$store.dispatch('unitStates/fetch');
  },
  methods: {
    getParkName(parkId) {
      return this.$store.getters['parks/parkName'](parkId);
    },

    getUnitStateName(unitStateName) {
      return this.$store.getters['unitStates/unitStateName'](unitStateName) || '?';
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

    formatDate(date) {
      if (!date) {
        return null;
      }
      return moment(date).format('L');
    },
  },
};
