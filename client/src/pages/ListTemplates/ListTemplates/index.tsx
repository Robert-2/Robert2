import './index.scss';
import { toRefs, ref, watch } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import useRoutePage from '@/hooks/useRoutePage';
import apiListTemplates from '@/stores/api/list-templates';
import CriticalError from '@/components/CriticalError';
import ItemActions from './ItemActions';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ServerTableInstance, ServerTableOptions, TableRow } from 'vue-tables-2';
import type { PaginationParams, PaginatedData } from '@/stores/api/@types';
import type { ListTemplate } from '@/stores/api/list-templates';

type Props = {
    withTrashed: boolean,
    onLoading(isLoading: boolean): void,
};

// @vue/component
const ListTemplates = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();

    const { withTrashed } = toRefs(props);

    const dataTable = ref<ServerTableInstance | null>(null);
    const hasError = ref<boolean>(false);

    const routePage = useRoutePage();

    const options = ref<ServerTableOptions<PaginatedData<ListTemplate[]>>>({
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'name', ascending: true },
        initialPage: routePage.value,
        sortable: ['name', 'description'],
        headings: {
            name: __('name'),
            description: __('description'),
            actions: '',
        },
        columnsClasses: {
            actions: 'ListTemplates__actions',
        },
        requestFunction: async (pagination: PaginationParams) => {
            try {
                emit('loading', true);
                hasError.value = false;

                const data = await apiListTemplates.all({
                    paginated: true,
                    ...pagination,
                    deleted: withTrashed.value,
                });

                return { data };
            } catch (err) {
                hasError.value = true;
            } finally {
                emit('loading', false);
            }
            return undefined;
        },
    });

    const refresh = (): void => {
        dataTable.value?.refresh();
    };

    watch(withTrashed, () => { refresh(); });

    return () => (
        <div class="ListTemplates">
            {hasError.value && <CriticalError />}
            <v-server-table
                ref={dataTable}
                name="templatesListsTable"
                columns={['name', 'description', 'actions']}
                options={options.value}
                scopedSlots={{
                    actions: ({ row }: TableRow<ListTemplate>) => (
                        <ItemActions
                            id={row.id}
                            isTrashMode={withTrashed.value}
                            onChanged={refresh}
                        />
                    ),
                }}
            />
        </div>
    );
};

ListTemplates.props = {
    withTrashed: { type: Boolean, default: false },
};

export default ListTemplates;
