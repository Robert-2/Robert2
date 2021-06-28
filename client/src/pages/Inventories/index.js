import './index.scss';
import Page from '@/components/Page';
import Loading from '@/components/Loading';
import CriticalError from '@/components/CriticalError';
import ParkSelector from './ParkSelector';
import Inventories from './Inventories';

const InventoriesPage = {
  name: 'InventoriesPage',
  data() {
    return {
      isLoading: true,
      hasError: false,
      parks: [],
      park: null,
    };
  },
  async mounted() {
    try {
      this.parks = await this.$store.dispatch('parks/fetch', true);

      if ('parkId' in this.$route.params) {
        const parkId = parseInt(this.$route.params.parkId, 10);
        const park = this.parks.find((_park) => _park.id === parkId);

        if (park === undefined) {
          this.$router.replace({ name: 'inventories' });
          return;
        }

        this.park = park;
        return;
      }

      if (this.parks.length === 1) {
        this.park = this.parks.slice(0, 1).shift();
        this.$router.replace({ name: 'park-inventories', params: { parkId: this.park.id } });
      }
    } catch {
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    handleParkChange(park) {
      this.park = park;
      this.$router.push({ name: 'park-inventories', params: { parkId: this.park.id } });
    },
  },
  render() {
    const { $t: __ } = this;

    const render = () => {
      if (this.isLoading) {
        return <Loading />;
      }

      if (this.hasError) {
        return <CriticalError />;
      }

      if (this.park === null) {
        return (
          <ParkSelector
            list={this.parks}
            onChange={this.handleParkChange}
          />
        );
      }

      return <Inventories parkId={this.park.id} />;
    };

    const title = this.park !== null
      ? __('page-inventories.title-with-park', { park: this.park.name })
      : __('page-inventories.title');

    const actions = [];
    if (this.park !== null) {
      actions.push(
        <router-link to={`/parks/${this.park.id}/inventories/new`} custom>
          {({ navigate }) => (
            <button class="info" onClick={navigate}>
              <i class="fas fa-plus" />&nbsp;
              {__('page-inventories.add')}
            </button>
          )}
        </router-link>,
      );
    }

    return (
      <Page
        name="inventories"
        title={title}
        actions={actions}
        render={render}
      />
    );
  },
};

export default InventoriesPage;
