import './index.scss';
import moment from 'moment';
import Config from '@/config/globalConfig';
import Loading from '@/components/Loading';
import EmptyMessage from '@/components/EmptyMessage';
import CriticalError from '@/components/CriticalError';

const Inventories = {
  name: 'Inventories',
  props: {
    parkId: { type: Number, required: true },
  },
  data() {
    return {
      isLoading: true,
      hasCriticalError: false,
      inventories: [],
      columns: ['date', 'author', 'actions'],
      tableOptions: {
        columnsDropdown: false,
        preserveState: true,
        orderBy: { column: 'date', ascending: false },
        initialPage: 1,
        perPage: Config.defaultPaginationLimit,
        sortable: ['date'],
        headings: {
          date: this.$t('page-inventories.date'),
          author: this.$t('page-inventories.author'),
          actions: null,
        },
        columnsClasses: {
          actions: 'Inventories__actions',
        },
        templates: {
          date: (h, { date }) => moment(date).format('L'),
          author: (h, { author }) => (author?.person?.full_name || ''),
          actions: (h, row) => (
              <a
                href={this.getDownloadUrl(row.id)}
                v-tooltip={this.$t('print')}
                class="button"
                download
              >
                <i class="fas fa-print" />
              </a>
          ),
        },
      },
    };
  },
  computed: {
    isEmpty() {
      return this.inventories.length === 0;
    },
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    handleAddClick() {
      this.$emit('addClick');
    },

    async fetchData() {
      this.isLoading = true;

      try {
        const { data } = await this.$http.get(`parks/${this.parkId}/inventories`);
        this.inventories = data;
      } catch {
        this.hasCriticalError = true;
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
    const {
      $t: __,
      isEmpty,
      isLoading,
      hasCriticalError,
      inventories,
      columns,
      tableOptions,
      handleAddClick,
    } = this;

    const render = () => {
      if (hasCriticalError) {
        return <CriticalError />;
      }

      if (isLoading) {
        return <Loading />;
      }

      if (isEmpty) {
        return (
          <EmptyMessage
            message={__('page-inventories.empty')}
            action={{
              label: __('page-inventories.add'),
              onClick: handleAddClick,
            }}
          />
        );
      }

      return (
        <v-client-table
          name="inventoriesTable"
          data={inventories}
          columns={columns}
          options={tableOptions}
        />
      );
    };
    return <div class="Inventories">{render()}</div>;
  },
};

export default Inventories;
