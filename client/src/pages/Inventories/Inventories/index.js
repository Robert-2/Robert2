import './index.scss';
import classnames from 'classnames';
import moment from 'moment';
import Config from '@/config/globalConfig';
import Loading from '@/components/Loading';
import Help from '@/components/Help/Help.vue';
import { Fragment } from 'vue-fragment';

const Inventories = {
  name: 'Inventories',
  props: {
    parkId: { type: Number, required: true },
  },
  data() {
    return {
      isLoading: true,
      error: null,
      inventories: [],
      columns: ['created_at', 'is_tmp', 'date', 'author', 'actions'],
      tableOptions: {
        columnsDropdown: false,
        preserveState: true,
        orderBy: { column: 'created_at', ascending: false },
        initialPage: 1,
        perPage: Config.defaultPaginationLimit,
        sortable: ['created_at', 'date'],
        headings: {
          created_at: this.$t('page-inventories.created-at'),
          is_tmp: this.$t('page-inventories.is-terminated'),
          date: this.$t('page-inventories.terminated-at'),
          author: this.$t('page-inventories.author'),
          actions: this.$t('actions'),
        },
        columnsClasses: {
          actions: 'Inventories__actions',
        },
        rowClassCallback: (row) => classnames({
          'VueTables__row--warning': row.is_tmp,
        }),
        templates: {
          created_at: (h, row) => moment(row.created_at).format('L'),
          is_tmp: (h, row) => (row.is_tmp ? this.$t('no') : this.$t('yes')),
          date: (h, { date }) => (date ? moment(date).format('L') : this.$t('in-progress')),
          author: (h, { author }) => (author?.person?.full_name || ''),
          actions: (h, row) => (
            <Fragment>
              {!row.is_tmp && (
                <a
                  href={this.getDownloadUrl(row.id)}
                  download
                  class="button Inventories__action"
                  v-tooltip={this.$t('print')}
                >
                  <i class="fas fa-print" />
                </a>
              )}
              {row.is_tmp && (
                <router-link to={`/parks/${this.parkId}/inventories/new`} custom>
                  {({ navigate }) => (
                    <button
                      class="info Inventories__action"
                      onClick={navigate}
                      v-tooltip={this.$t('page-inventories.continue')}
                    >
                      <i class="fas fa-edit" />
                    </button>
                  )}
                </router-link>
              )}
            </Fragment>
          ),
        },
      },
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await this.$http.get(`parks/${this.parkId}/inventories`);
        this.inventories = data;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    getDownloadUrl(inventoryId) {
      const { baseUrl } = Config;
      return `${baseUrl}/inventories/${inventoryId}/pdf`;
    },
  },
  render() {
    const { isLoading, error, inventories, columns, tableOptions } = this;

    return (
      <div class="Inventories">
        {isLoading && <Loading />}
        {!isLoading && error && <Help message="" error={error} />}
        {!isLoading && !error && (
          <v-client-table
            name="inventoriesTable"
            data={inventories}
            columns={columns}
            options={tableOptions}
          />
        )}
      </div>
    );
  },
};

export default Inventories;
