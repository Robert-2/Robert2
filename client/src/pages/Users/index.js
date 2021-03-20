import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';

export default {
  name: 'Users',
  components: { Help },
  data() {
    return {
      help: 'page-users.help',
      error: null,
      isLoading: false,
      isDisplayTrashed: false,
      isTrashDisplayed: false,
      columns: [
        'pseudo',
        'full_name',
        'group_id',
        'email',
        'phone',
        'address',
        'actions',
      ],
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'pseudo', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: ['pseudo', 'group_id', 'email'],
        columnsDisplay: {
          // - This is a hack: init the table with hidden columns by default
          address: 'mobile',
        },
        headings: {
          pseudo: this.$t('pseudo'),
          full_name: this.$t('name'),
          group_id: this.$t('group'),
          email: this.$t('email'),
          phone: this.$t('phone'),
          address: this.$t('address'),
          actions: '',
        },
        columnsClasses: {
          pseudo: 'Users__pseudo',
          full_name: 'Users__name',
          group_id: 'Users__group',
          email: 'Users__email',
          phone: 'Users__phone',
          address: 'Users__address',
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
    currentUserId() {
      return this.$store.state.auth.user.id;
    },
  },
  methods: {
    deleteUser(userId) {
      const isSoft = !this.isTrashDisplayed;
      Alert.ConfirmDelete(this.$t, 'users', isSoft)
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.delete(`${this.$route.meta.resource}/${userId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    restoreUser(userId) {
      Alert.ConfirmRestore(this.$t, 'users')
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.put(`${this.$route.meta.resource}/restore/${userId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    refreshTable() {
      this.help = 'page-users.help';
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    showTrashed() {
      this.isDisplayTrashed = !this.isDisplayTrashed;
      this.refreshTable();
    },

    showError(error) {
      this.error = error;
      this.isLoading = false;
    },
  },
};
