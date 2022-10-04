import './index.scss';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Page from '@/themes/default/components/Page';
import Button from '@/themes/default/components/Button';
import apiTechnicians from '@/stores/api/technicians';
import TechnicianInfos from './tabs/Infos';
import TechnicianSchedule from './tabs/Schedule';

// @vue/component
export default {
    name: 'TechnicianViewPage',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            isLoading: false,
            isFetched: false,
            criticalError: null,
            technician: null,
            tabsIndexes: ['#infos', '#schedule'],
            selectedTabIndex: 0,
        };
    },
    computed: {
        pageTitle() {
            const { $t: __, isFetched, technician } = this;

            return isFetched
                ? __('page.technician-view.title', { name: technician.full_name })
                : __('technician');
        },

        tabsActions() {
            const { $t: __, tabsIndexes, selectedTabIndex } = this;

            if (tabsIndexes[selectedTabIndex] === '#infos') {
                const { id } = this;

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
            this.isLoading = true;
            try {
                const data = await apiTechnicians.one(this.id);
                this.technician = data;
                this.isFetched = true;
            } catch (error) {
                const status = error?.response?.status ?? 500;
                this.criticalError = status === 404 ? ERROR.NOT_FOUND : ERROR.UNKNOWN;
            } finally {
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
            criticalError,
            technician,
            selectedTabIndex,
            handleSelectTab,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="technician-view" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
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
