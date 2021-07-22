import './index.scss';
import moment from 'moment';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import Page from '@/components/Page';
import Datepicker from '@/components/Datepicker';
import ItemActions from './Actions';

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
      periodFilter: null,
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
          actions: 'Technicians__actions',
        },
        requestFunction: (pagination) => {
          this.error = null;
          this.isLoading = true;

          const params = {
            ...pagination,
            deleted: this.isDisplayTrashed ? '1' : '0',
          };
          if (this.periodFilter) {
            const [start, end] = this.periodFilter;
            params.startDate = moment(start).format();
            params.endDate = moment(end).endOf('day').format();
          }

          return this.$http
            .get('technicians', { params })
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
    remove(id) {
      return async () => {
        const isSoft = !this.isTrashDisplayed;
        const { value } = await Alert.ConfirmDelete(this.$t, 'technicians', isSoft);
        if (!value) {
          return;
        }

        this.error = null;
        this.isLoading = true;

        try {
          await this.$http.delete(`${this.$route.meta.resource}/${id}`);
          this.refreshTable();
        } catch (error) {
          this.error = error;
        } finally {
          this.isLoading = false;
        }
      };
    },

    restore(id) {
      return async () => {
        const { value } = await Alert.ConfirmRestore(this.$t, 'technicians');
        if (!value) {
          return;
        }

        this.error = null;
        this.isLoading = true;

        try {
          await this.$http.put(`${this.$route.meta.resource}/restore/${id}`);
          this.refreshTable();
        } catch (error) {
          this.error = error;
        } finally {
          this.isLoading = false;
        }
      };
    },

    refreshTable() {
      this.help = 'page-technicians.help';
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    clearFilters() {
      this.periodFilter = null;
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
  watch: {
    periodFilter() {
      this.refreshTable();
    },
  },
  render() {
    const {
      $t: __,
      help,
      error,
      isLoading,
      columns,
      options,
      restore,
      remove,
      periodFilter,
      clearFilters,
      isTrashDisplayed,
      showTrashed,
    } = this;

    const headerActions = [
      <router-link to="/technicians/new" custom>
        {({ navigate }) => (
          <button onClick={navigate} class="Technicians__create success">
            <i class="fas fa-user-plus" /> {__('page-technicians.action-add')}
          </button>
        )}
      </router-link>,
    ];

    const footerActions = [
      <button class={isTrashDisplayed ? 'info' : 'warning'} onClick={showTrashed}>
        <i class={['fas', { 'fa-trash': !isTrashDisplayed, 'fa-eye"': isTrashDisplayed }]} />{' '}
        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
      </button>,
    ];

    return (
      <Page
        name="technicians"
        title={__('page-technicians.title')}
        help={__(help)}
        error={error}
        isLoading={isLoading}
        actions={headerActions}
        footerActions={footerActions}
      >
        <div class="Technicians__filters">
          <Datepicker
            vModel={this.periodFilter}
            isRange
            placeholder={__('page-technicians.period-of-availability')}
          />
          {periodFilter && (
            <button
              class="Technicians__filters__clear-button warning"
              vTooltip={__('clear-filters')}
              onClick={clearFilters}
            >
              <i class="fas fa-backspace" />
            </button>
          )}
        </div>
        <v-server-table
          ref="DataTable"
          name="techniciansTable"
          columns={columns}
          options={options}
          scopedSlots={{
            email: ({ row }) => <a href={`mailto:${row.email}`}>{row.email}</a>,
            address: ({ row }) => (
              <div>
                {row.street}<br />
                {row.postal_code} {row.locality}
              </div>
            ),
            actions: ({ row }) => (
              <ItemActions
                isTrashMode={isTrashDisplayed}
                id={row.id}
                remove={remove}
                restore={restore}
              />
            ),
          }}
        />
      </Page>
    );
  },
};
