import './index.scss';
import { Tabs, Tab } from '@/components/Tabs';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Page from '@/components/Page';
import Button from '@/components/Button';
import apiTechnicians from '@/stores/api/technicians';
import TechnicianInfos from './Infos';
import TechnicianSchedule from './Schedule';

// @vue/component
export default {
    name: 'TechnicianViewPage',
    data() {
        return {
            isLoading: false,
            isFetched: false,
            hasCriticalError: false,
            technician: null,
            tabsIndexes: ['#infos', '#schedule'],
            selectedTabIndex: 0,
        };
    },
    computed: {
        pageTitle() {
            const { $t: __, technician } = this;

            return technician
                ? __('page-technician-view.title', { name: technician.full_name })
                : __('technician');
        },

        tabsActions() {
            const { $t: __, tabsIndexes, selectedTabIndex } = this;

            if (tabsIndexes[selectedTabIndex] === '#infos') {
                const { id } = this.$route.params;
                return [
                    <Button type="edit" to={{ name: 'edit-technician', params: { id } }}>
                        {__('action-edit')}
                    </Button>,
                ];
            }

            return [];
        },
    },
    created() {
        const { hash } = this.$route;
        if (hash && this.tabsIndexes.includes(hash)) {
            this.selectedTabIndex = this.tabsIndexes.findIndex((tab) => tab === hash);
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSelectTab(index) {
            this.selectedTabIndex = index;
            this.$router.replace(this.tabsIndexes[index]);
        },

        // ------------------------------------------------------
        // -
        // -    Internal Methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { id } = this.$route.params;

            this.isLoading = true;

            try {
                const data = await apiTechnicians.one(id);
                this.technician = data;
            } catch (error) {
                const { code } = error.response?.data?.error ?? { code: 0 };
                this.hasCriticalError = code === 404 ? 'not-found' : true;
            } finally {
                this.isFetched = true;
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            pageTitle,
            tabsActions,
            isLoading,
            isFetched,
            hasCriticalError,
            technician,
            selectedTabIndex,
            handleSelectTab,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="technician-view" title={pageTitle}>
                    {hasCriticalError
                        ? <CriticalError type={hasCriticalError === 'not-found' ? 'not-found' : 'default'} />
                        : <Loading />}
                </Page>
            );
        }

        return (
            <Page name="technician-view" title={pageTitle} isLoading={isLoading}>
                <div class="TechnicianView">
                    <Tabs
                        defaultIndex={selectedTabIndex}
                        onSelect={handleSelectTab}
                        actions={tabsActions}
                    >
                        <Tab title={__('informations')} icon="info-circle">
                            <TechnicianInfos technician={technician} />
                        </Tab>
                        <Tab title={__('schedule')} icon="calendar-alt">
                            <TechnicianSchedule technician={technician} />
                        </Tab>
                    </Tabs>
                </div>
            </Page>
        );
    },
};
