import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';

export default {
  name: 'Parks',
  components: { Help },
  data() {
    return {
      help: 'page-parks.help',
      error: null,
      isLoading: false,
      isDisplayTrashed: false,
      isTrashDisplayed: false,
      columns: [
        'name',
        'address',
        'opening_hours',
        'totalItems',
        'events',
        'note',
        'actions',
      ],
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'name', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: ['name'],
        columnsDisplay: {
          // - This is a hack: init the table with hidden columns by default
          note: 'mobile',
        },
        headings: {
          name: this.$t('name'),
          address: this.$t('address'),
          opening_hours: this.$t('opening-hours'),
          totalItems: this.$t('page-parks.total-items'),
          events: '',
          note: this.$t('notes'),
          actions: '',
        },
        columnsClasses: {
          address: 'Parks__address',
          opening_hours: 'Parks__opening-hours',
          events: 'Parks__events',
          note: 'Parks__note',
        },
        requestFunction: (pagination) => {
          this.error = null;
          this.isLoading = true;
          const params = {
            ...pagination,
            deleted: this.isDisplayTrashed ? '1' : '0',
          };
          return this.$http
            .get(this.$route.meta.resource, { params })
            .catch(this.showError)
            .finally(() => {
              this.isTrashDisplayed = this.isDisplayTrashed;
              this.isLoading = false;
            });
        },
      },
    };
  },
  computed: {
    parksCount() {
      return this.$store.state.parks.list.length;
    },
  },
  methods: {
    getDownloadListingUrl(parkId) {
      const { baseUrl } = Config;
      return `${baseUrl}/materials/pdf?park=${parkId}`;
    },

    deletePark(parkId) {
      const isSoft = !this.isTrashDisplayed;
      Alert.ConfirmDelete(this.$t, 'parks', isSoft)
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.$http.delete(`${this.$route.meta.resource}/${parkId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    restorePark(parkId) {
      Alert.ConfirmRestore(this.$t, 'parks')
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.put(`${this.$route.meta.resource}/restore/${parkId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    formatAmount(amount) {
      return formatAmount(amount);
    },

    refreshTable() {
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
      this.$store.dispatch('parks/refresh');
    },

    showTrashed() {
      this.isDisplayTrashed = !this.isDisplayTrashed;
      this.refreshTable();
    },

    showError(error) {
      this.isLoading = false;
      this.error = error;
    },
  },
};
