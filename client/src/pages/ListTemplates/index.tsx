import './index.scss';
import { ref } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import apiListTemplates from '@/stores/api/list-templates';
import Page from '@/components/Page';
import getRouteQueryPage from '@/utils/getRouteQueryPage';
import ItemActions from './ItemActions';

import type { ServerTableInstance, ServerTableOptions, TableRow } from 'vue-table-2';
import type { Render } from '@vue/composition-api';
import type { PaginatedData } from '@/globals/types/pagination';
import type { ListTemplate } from '@/stores/api/list-templates';

// @vue/component
const ListTemplatesPage = (): Render => {
    const __ = useI18n();

    const { route } = useRouter();

    const dataTable = ref<ServerTableInstance | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<unknown | null>(null);
    const isTrashDisplayed = ref<boolean>(false);

    const options = ref<ServerTableOptions<PaginatedData<ListTemplate[]>>>({
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'name', ascending: true },
        initialPage: getRouteQueryPage(route),
        sortable: ['name', 'description'],
        headings: {
            name: __('name'),
            description: __('description'),
            actions: '',
        },
        columnsClasses: {
            actions: 'ListTemplates__actions',
        },
        requestFunction: async (pagination) => {
            try {
                isLoading.value = true;
                error.value = null;

                const data = await apiListTemplates.all({
                    ... pagination,
                    deleted: isTrashDisplayed.value ? '1' : '0',
                });

                return { data };
            } catch (err) {
                error.value = err;
            } finally {
                isLoading.value = false;
            }
        },
    });

    const refresh = () => {
        dataTable.value?.refresh();
    }

    const showTrashed = () => {
        isTrashDisplayed.value = !isTrashDisplayed.value;
        refresh();
    }

    const headerActions = [
        <router-link to="/list-templates/new" class="button success">
            <i class="fas fa-plus" /> {__('page-list-templates.action-add')}
        </router-link>,
    ];

    return () => (
        <Page
            name="list-templates"
            title={__('page-list-templates.title')}
            help={__('page-list-templates.help')}
            error={error.value}
            isLoading={isLoading.value}
            actions={headerActions}
        >
            <v-server-table
                ref={dataTable}
                name="templatesListsTable"
                columns={['name', 'description', 'actions']}
                options={options.value}
                scopedSlots={{
                    actions: ({ row }: TableRow<ListTemplate>) => (
                        <ItemActions
                            id={row.id}
                            isTrashMode={isTrashDisplayed.value}
                            onChanged={refresh}
                        />
                    ),
                }}
            />
            <div class="content__footer">
                <button
                    type="button"
                    class={isTrashDisplayed.value ? 'info' : 'warning'}
                    onClick={showTrashed}
                >
                    <i class={['fas', { 'fa-trash': !isTrashDisplayed.value, 'fa-eye"': isTrashDisplayed.value }]} />{' '}
                    {isTrashDisplayed.value ? __('display-not-deleted-items') : __('open-trash-bin')}
                </button>
            </div>
        </Page>
    );
};

export default ListTemplatesPage;
