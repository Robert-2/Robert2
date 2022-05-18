import './index.scss';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import { Tabs, Tab } from '@/components/Tabs';
import Button from '@/components/Button';
import apiMaterials from '@/stores/api/materials';
import Infos from './Infos';
import Documents from './Documents';

// @vue/component
export default {
    name: 'MaterialView',
    data() {
        return {
            material: null,
            isLoading: false,
            isFetched: false,
            hasCriticalError: false,
            selectedTabIndex: 0,
        };
    },
    computed: {
        pageTitle() {
            const { $t: __, material } = this;

            return material
                ? __('page-material-view.title', { name: material.name })
                : __('page-material-view.title-simple');
        },

        tabsIndexes() {
            return ['#infos', '#documents'];
        },

        tabsActions() {
            const { $t: __, tabsIndexes, selectedTabIndex } = this;
            const { id } = this.$route.params;

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
            const { id } = this.$route.params;

            this.isLoading = true;

            try {
                const data = await apiMaterials.one(id);
                this.material = data;
                this.selectTabFromRouting();
            } catch (error) {
                const { code } = error.response?.data?.error ?? { code: 0 };
                this.hasCriticalError = code === 404 ? 'not-found' : true;
            } finally {
                this.isLoading = false;
                this.isFetched = true;
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
            material,
            handleSelectTab,
            selectedTabIndex,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="material-view" title={pageTitle}>
                    {hasCriticalError
                        ? <CriticalError type={hasCriticalError === 'not-found' ? 'not-found' : 'default'} />
                        : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="material-view"
                title={pageTitle}
                isLoading={isLoading}
            >
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
