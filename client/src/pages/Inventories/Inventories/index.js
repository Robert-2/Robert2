import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import Loading from '@/components/Loading';

const Inventories = {
  name: 'Inventories',
  props: {
    parkId: { type: Number, required: true },
  },
  data() {
    return {
      isLoading: true,
      hasError: false,
      park: null,
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      this.hasError = false;

      try {
        await this.$http.get(`parks/${this.parkId}`);
      } catch {
        // TODO: Traitement différencié des erreurs 404.

        this.hasError = true;
      } finally {
        this.isLoading = false;
      }
    },
  },
  render() {
    const { $t: __ } = this;

    const render = () => {
      if (this.isLoading) {
        return <Loading />;
      }

      return (
          <Tabs>
            <template slot="latest">
              <i class="fas fa-box-open" /> {__('page-inventories.tab-latest')}
            </template>
            <template slot="archives">
              <i class="fas fa-boxes" /> {__('page-inventories.tab-archives')}
            </template>

            <Tab title-slot="latest">
              Vue d'ensemble.
            </Tab>
            <Tab title-slot="archives">
              Archives.
            </Tab>

            {/* Menu contextuel droit */}
            <template slot="right">
              <nav class="Inventories__menu">
                <router-link
                  v-tooltip={__('action-add')}
                  to={{ name: 'park-inventories-new', params: { parkId: this.parkId } }}
                  custom
                >
                  {({ navigate }) => (
                    <button class="info" onClick={navigate}>
                      <i class="fas fa-plus" />&nbsp;
                      {__('page-inventories.add')}
                    </button>
                  )}
                </router-link>
              </nav>
            </template>
        </Tabs>
      );
    };
    return <div class="Inventories">{render()}</div>;
  },
};

export default Inventories;
