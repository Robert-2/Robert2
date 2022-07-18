import './index.scss';
import Page from '@/components/Page';
import CriticalError, { ERROR } from '@/components/CriticalError';
import Loading from '@/components/Loading';
import { Tabs, Tab } from '@/components/Tabs';
import Button from '@/components/Button';
import apiMaterials from '@/stores/api/materials';
import Infos from './tabs/Infos';
import Documents from './tabs/Documents';

// @vue/component
export default {
    name: 'MaterialView',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            material: null,
            isLoading: false,
            isFetched: false,
            selectedTabIndex: 0,
            criticalError: null,
        };
    },
    computed: {
        pageTitle() {
            const { $t: __, isFetched, material } = this;

            return isFetched
                ? __('page.material-view.title', { name: material.name })
                : __('page.material-view.title-simple');
        },

        tabsIndexes() {
            return ['#infos', '#documents'];
        },

        tabsActions() {
            const { $t: __, id, tabsIndexes, selectedTabIndex } = this;

            switch (tabsIndexes[selectedTabIndex]) {
                case '#infos':
                    return [
                        <Button type="edit" to={{ name: 'edit-material', params: { id } }}>
                            {__('action-edit')}
                        </Button>,
                    ];
                default:
                    return [];
            }
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');

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
        // -    Internal methods
        // -
        // ------------------------------------------------------

        selectTabFromRouting() {
            const { hash } = this.$route;
            if (hash && this.tabsIndexes.includes(hash)) {
                this.selectedTabIndex = this.tabsIndexes.findIndex((tab) => tab === hash);
            }
        },

        async fetchData() {
            this.isLoading = true;
            try {
                const data = await apiMaterials.one(this.id);
                this.material = data;
                this.selectTabFromRouting();
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
            material,
            handleSelectTab,
            selectedTabIndex,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="material-view" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page name="material-view" title={pageTitle} isLoading={isLoading}>
                <div class="MaterialView">
                    <Tabs
                        defaultIndex={selectedTabIndex}
                        onSelect={handleSelectTab}
                        actions={tabsActions}
                    >
                        <Tab title={__('informations')} icon="info-circle">
                            <Infos material={material} />
                        </Tab>
                        <Tab title={__('documents')} icon="file-pdf">
                            <Documents material={material} />
                        </Tab>
                    </Tabs>
                </div>
            </Page>
        );
    },
};
