import Config from '@/config/globalConfig';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';

export default {
  name: 'Beneficiaries',
  components: { Help },
  data() {
    return {
      help: 'page-beneficiaries.help',
      error: null,
      isLoading: false,
      isDisplayTrashed: false,
      isTrashDisplayed: false,
      columns: [
        'last_name',
        'first_name',
        'reference',
        'company',
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
        sortable: ['last_name', 'first_name', 'reference', 'company', 'email'],
        columnsDisplay: {
          // - This is a hack: init the table with hidden columns by default
          note: 'mobile',
        },
        headings: {
          last_name: this.$t('last-name'),
          first_name: this.$t('first-name'),
          reference: this.$t('reference'),
          company: this.$t('company'),
          email: this.$t('email'),
          phone: this.$t('phone'),
          address: this.$t('address'),
          note: this.$t('notes'),
          actions: '',
        },
        columnsClasses: {
          company: 'Beneficiaries__company',
          email: 'Beneficiaries__email',
          address: 'Beneficiaries__address',
          note: 'Beneficiaries__note',
        },
        requestFunction: (pagination) => {
          this.isLoading = true;
          this.error = null;
          const params = {
            ...pagination,
            tags: [Config.beneficiaryTagName],
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
    deleteBeneficiary(beneficiaryId) {
      const isSoft = !this.isTrashDisplayed;
      Alert.ConfirmDelete(this.$t, 'beneficiaries', isSoft)
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.delete(`${this.$route.meta.resource}/${beneficiaryId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    restoreBeneficiary(beneficiaryId) {
      Alert.ConfirmRestore(this.$t, 'beneficiaries')
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.put(`${this.$route.meta.resource}/restore/${beneficiaryId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    refreshTable() {
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
