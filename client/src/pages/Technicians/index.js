import Config from '@/config/globalConfig';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';

export default {
  name: 'Technicians',
  components: { Help },
  data() {
    return {
      help: 'page-technicians.help',
      error: null,
      isLoading: false,
      isDisplayTrashed: false,
      isTrashDisplayed: false,
      columns: [
        'last_name',
        'first_name',
        'nickname',
        'email',
        'phone',
        'address',
        'note',
        'actions',
      ],
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'last_name', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: ['last_name', 'first_name', 'nickname', 'email'],
        columnsDisplay: {
          // - This is a hack: init the table with hidden columns by default
          note: 'mobile',
        },
        headings: {
          last_name: this.$t('last-name'),
          first_name: this.$t('first-name'),
          nickname: this.$t('nickname'),
          email: this.$t('email'),
          phone: this.$t('phone'),
          address: this.$t('address'),
          note: this.$t('notes'),
          actions: '',
        },
        columnsClasses: {
          nickname: 'Technicians__nickname',
          email: 'Technicians__email',
          address: 'Technicians__address',
          note: 'Technicians__note',
        },
        requestFunction: (pagination) => {
          this.error = null;
          this.isLoading = true;
          const params = {
            ...pagination,
            tags: [Config.technicianTagName],
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
  methods: {
    deleteTechnician(technicianId) {
      const isSoft = !this.isTrashDisplayed;
      Alert.ConfirmDelete(this.$t, 'technicians', isSoft)
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.delete(`${this.$route.meta.resource}/${technicianId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    restoreTechnician(technicianId) {
      Alert.ConfirmRestore(this.$t, 'technicians')
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.put(`${this.$route.meta.resource}/restore/${technicianId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    refreshTable() {
      this.help = 'page-technicians.help';
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
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
