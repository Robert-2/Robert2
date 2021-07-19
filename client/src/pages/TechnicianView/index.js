import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import Page from '@/components/Page';
import TechnicianInfos from './Infos';
import TechnicianSchedule from './Schedule';

const TechnicianViewPage = {
  name: 'TechnicianViewPage',
  data() {
    return {
      isLoading: false,
      error: null,
      technician: null,
      tabsIndexes: ['#infos', '#schedule'],
      selectedTabIndex: 0,
    };
  },
  computed: {
    id() {
      const { id } = this.$route.params;
      if (!Number.isNaN(id) && Number.isFinite(parseInt(id, 10))) {
        return parseInt(id, 10);
      }
      return null;
    },
  },

  created() {
    const { hash } = this.$route;
    if (hash && this.tabsIndexes.includes(hash)) {
      this.selectedTabIndex = this.tabsIndexes.findIndex((tab) => tab === hash);
    }
  },
  mounted() {
    this.fetchTechnician();
  },
  methods: {
    async fetchTechnician() {
      const { id } = this;

      this.isLoading = true;

      try {
        const { resource } = this.$route.meta;
        const { data } = await this.$http.get(`${resource}/${id}`);
        this.setTechnicianData(data);
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    setTechnicianData(data) {
      this.technician = data;
    },
  },
  render() {
    const { $t: __, isLoading, error, technician, selectedTabIndex } = this;

    let pageTitle = __('technician');
    if (technician) {
      pageTitle = __('page-technician-view.title', { name: technician.full_name });
    }

    const tabsTitles = {
      infos: <span><i class="fas fa-info-circle" /> {__('informations')}</span>,
      schedule: <span><i class="fas fa-calendar-alt" /> {__('schedule')}</span>,
    };

    const renderTab = (TabContent) => {
      if (isLoading) {
        return <Loading />;
      }
      if (error) {
        return <ErrorMessage error={error} />;
      }
      if (!technician) {
        return null;
      }

      return <TabContent technician={technician} />;
    };

    return (
      <Page name="technician-view" title={pageTitle}>
        <Tabs defaultIndex={selectedTabIndex} class="TechnicianView">
          <Tab title={tabsTitles.infos}>
            {renderTab(TechnicianInfos)}
          </Tab>
          <Tab title={tabsTitles.schedule}>
            {renderTab(TechnicianSchedule)}
          </Tab>
        </Tabs>
      </Page>
    );
  },
};

export default TechnicianViewPage;
