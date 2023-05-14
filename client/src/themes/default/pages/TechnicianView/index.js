import './index.scss';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import apiTechnicians from '@/stores/api/technicians';
import { confirm } from '@/utils/alert';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Page from '@/themes/default/components/Page';
import Button from '@/themes/default/components/Button';
import Infos from './tabs/Infos';
import Schedule from './tabs/Schedule';
import Documents from './tabs/Documents';

const TABS = [
    'infos',
    'schedule',
    'documents',
];

// @vue/component
export default {
    name: 'TechnicianViewPage',
    data() {
        return {
            id: parseInt(this.$route.params.id, 10),
            isLoading: false,
            isFetched: false,
            criticalError: null,
            technician: null,
            tabsIndexes: ['#infos', '#schedule', '#documents'],
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
            this.selectedTabIndex = this.tabsIndexes.indexOf(hash);
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

        async handleTabChange(event) {
            if (event.prevIndex !== TABS.indexOf('documents')) {
                return;
            }

            const { documentsRef } = this.$refs;
            if (!documentsRef?.isUploading()) {
                return;
            }

            event.preventDefault();

            const { $t: __ } = this;
            const isConfirmed = await confirm({
                text: __('confirm-cancel-upload-change-tab'),
                type: 'danger',
            });
            if (!isConfirmed) {
                return;
            }

            event.executeDefault();
        },

        handleTabChanged(index) {
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
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error ocurred while retrieving technician #${this.id} data`, error);
                    this.criticalError = ERROR.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ERROR.NOT_FOUND
                        : ERROR.UNKNOWN;
                }
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
            handleTabChange,
            handleTabChanged,
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
                        onChange={handleTabChange}
                        onChanged={handleTabChanged}
                        actions={tabsActions}
                    >
                        <Tab title={__('informations')} icon="info-circle">
                            <Infos technician={technician} />
                        </Tab>
                        <Tab title={__('schedule')} icon="calendar-alt">
                            <Schedule technician={technician} />
                        </Tab>
                        <Tab title={__('documents')} icon="file-pdf">
                            <Documents ref="documentsRef" technician={technician} />
                        </Tab>
                    </Tabs>
                </div>
            </Page>
        );
    },
};
