import store from '@/store';

export default {
  name: 'MaterialViewUnits',
  props: {
    material: { required: true, type: Object },
  },
  data() {
    return {
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
  },
};
