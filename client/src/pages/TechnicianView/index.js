import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Page from '@/components/Page';
import TechnicianInfos from './Infos';
import TechnicianSchedule from './Schedule';

// @vue/component
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

        const render = () => {
            if (error) {
                return <CriticalError message={error.message} />;
            }

            if (isLoading || !technician) {
                return <Loading />;
            }

            return (
                <Tabs defaultIndex={selectedTabIndex} class="TechnicianView">
                    <Tab title={<span><i class="fas fa-info-circle" /> {__('informations')}</span>}>
                        <TechnicianInfos technician={technician} />
                    </Tab>
                    <Tab title={<span><i class="fas fa-calendar-alt" /> {__('schedule')}</span>}>
                        <TechnicianSchedule technician={technician} />
                    </Tab>
                </Tabs>
            );
        };

        return <Page name="technician-view" title={pageTitle} render={render} />;
    },
};

export default TechnicianViewPage;
