import './index.scss';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import apiMaterials from '@/stores/api/materials';
import { confirm } from '@/utils/alert';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import Button from '@/themes/default/components/Button';
import Infos from './tabs/Infos';
import Documents from './tabs/Documents';

const TABS = [
    'infos',
    'units',
    'documents',
    'availabilities',
];

// @vue/component
const MaterialView = {
    name: 'MaterialView',
    data() {
        return {
            id: parseInt(this.$route.params.id, 10),
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
                case '#units':
                    return [
                        <Button
                            type="add"
                            to={{ name: 'add-material-unit', params: { materialId: id } }}
                        >
                            {__('page.material-view.add-unit')}
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
                type: 'danger',
                text: __('confirm-cancel-upload-change-tab'),
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
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        selectTabFromRouting() {
            const { hash } = this.$route;
            if (hash && this.tabsIndexes.includes(hash)) {
                this.selectedTabIndex = this.tabsIndexes.indexOf(hash);
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
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while retrieving material #${this.id} data`, error);
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
            material,
            handleTabChange,
            handleTabChanged,
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
                        onChange={handleTabChange}
                        onChanged={handleTabChanged}
                        actions={tabsActions}
                    >
                        <Tab title={__('informations')} icon="info-circle">
                            <Infos material={material} />
                        </Tab>
                        <Tab title={__('documents')} icon="file-pdf">
                            <Documents ref="documentsRef" material={material} />
                        </Tab>
                    </Tabs>
                </div>
            </Page>
        );
    },
};

export default defineComponent(MaterialView);
