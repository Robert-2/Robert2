import './index.scss';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import isTruthy from '@/utils/isTruthy';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Page from '@/themes/default/components/Page';
import Fragment from '@/components/Fragment';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Dropdown from '@/themes/default/components/Dropdown';
import Button from '@/themes/default/components/Button';
import Link from '@/themes/default/components/Link';
import formatAddress from '@/utils/formatAddress';
import ItemsCount from './components/ItemsCount';
import TotalAmount from './components/TotalAmount';
import apiParks from '@/stores/api/parks';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';

import type { CreateElement } from 'vue';
import type { Column } from '@/themes/default/components/Table/Server';
import type { Park } from '@/stores/api/parks';
import type { ServerTableInstance } from 'vue-tables-2-premium';
import type { PaginationParams } from '@/stores/api/@types';

type Data = {
    hasCriticalError: boolean,
    isLoading: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
};

/** Page de listing des parcs de matériel. */
const Parks = defineComponent({
    name: 'Parks',
    data: (): Data => ({
        hasCriticalError: false,
        isLoading: false,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
    }),
    computed: {
        columns(): Array<Column<Park>> {
            const { $t: __, isTrashDisplayed, handleDeleteItem, handleRestoreItem } = this;

            return [
                {
                    key: 'name',
                    title: __('name'),
                    class: 'Parks__cell Parks__cell--name',
                    sortable: true,
                },
                !isTrashDisplayed && {
                    key: 'address',
                    title: __('address'),
                    class: 'Parks__cell Parks__cell--address',
                    render: (h: CreateElement, park: Park) => {
                        const address = formatAddress(park.street, park.postal_code, park.locality);
                        return address ?? (
                            <div class="Parks__cell__empty">
                                {__('not-specified')}
                            </div>
                        );
                    },
                },
                !isTrashDisplayed && {
                    key: 'opening_hours',
                    title: __('opening-hours'),
                    class: 'Parks__cell Parks__cell--opening-hours',
                    render: (h: CreateElement, { opening_hours: openingHours }: Park) => (
                        openingHours ?? (
                            <span class="Parks__cell__empty">
                                {__('not-specified')}
                            </span>
                        )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'totalItems',
                    title: __('page.parks.total-items'),
                    class: 'Parks__cell Parks__cell--total-items',
                    render: (h: CreateElement, park: Park) => (
                        <ItemsCount park={park} />
                    ),
                },
                !isTrashDisplayed && {
                    key: 'note',
                    title: __('notes'),
                    class: 'Parks__cell Parks__cell--note',
                    hidden: true,
                },
                !isTrashDisplayed && {
                    key: 'totalAmount',
                    title: __('total-value'),
                    class: 'Parks__cell Parks__cell--total-amount',
                    render: (h: CreateElement, park: Park) => (
                        <TotalAmount park={park} />
                    ),
                },
                !isTrashDisplayed && {
                    key: 'events',
                    title: __('events'),
                    class: 'Parks__cell Parks__cell--events',
                    render: (h: CreateElement, { id, total_items: itemsCount }: Park) => {
                        if (itemsCount === 0) {
                            return null;
                        }

                        return (
                            <Link to={{ name: 'schedule', query: { park: id } }}>
                                {__('page.parks.display-events-for-park')}
                            </Link>
                        );
                    },
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'Parks__cell Parks__cell--actions',
                    render(h: CreateElement, { id, total_items: itemsCount }: Park) {
                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <Button
                                        type="restore"
                                        onClick={() => { handleRestoreItem(id); }}
                                    />
                                    <Button
                                        type="delete"
                                        onClick={() => { handleDeleteItem(id); }}
                                    />
                                </Fragment>
                            );
                        }

                        const hasItems = itemsCount > 0;
                        return (
                            <Fragment>
                                <Button
                                    icon="clipboard-list"
                                    to={`${config.baseUrl}/materials/pdf?park=${id}`}
                                    tooltip={__('page.parks.print-materials-of-this-park')}
                                    disabled={!hasItems}
                                    external
                                />
                                <Dropdown>
                                    <Button
                                        type="edit"
                                        to={{ name: 'edit-park', params: { id } }}
                                    >
                                        {__('action-edit')}
                                    </Button>
                                    <Button
                                        type="trash"
                                        onClick={() => { handleDeleteItem(id); }}
                                        disabled={hasItems}
                                    >
                                        {__('action-delete')}
                                    </Button>
                                </Dropdown>
                            </Fragment>
                        );
                    },
                },
            ].filter(isTruthy);
        },
    },
    created() {
        // - Binding.
        this.fetch = this.fetch.bind(this);
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleDeleteItem(id: Park['id']) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('page.parks.confirm-delete')
                    : __('page.parks.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiParks.remove(id);
                (this.$refs.table as ServerTableInstance | undefined)?.refresh();
                this.$store.dispatch('parks/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItem(id: Park['id']) {
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                text: __('page.parks.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiParks.restore(id);
                (this.$refs.table as ServerTableInstance | undefined)?.refresh();
                this.$store.dispatch('parks/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            (this.$refs.table as ServerTableInstance | undefined)?.setPage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination: PaginationParams) {
            this.isLoading = true;

            try {
                const data = await apiParks.all({
                    ...pagination,
                    deleted: this.shouldDisplayTrashed,
                });
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    (this.$refs.table as ServerTableInstance | undefined)?.setPage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving parks:`, error);
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },
    },
    render() {
        const {
            $t: __,
            fetch,
            $options,
            columns,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleToggleShowTrashed,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="parks" title={__('page.parks.title')} centered>
                    <CriticalError />
                </Page>
            );
        }

        // - Titre de la page.
        const title = !isTrashDisplayed
            ? __('page.parks.title')
            : __('page.parks.title-trash');

        // - Aide de page.
        const help = !isTrashDisplayed
            ? __('page.parks.help')
            : undefined;

        // - Actions de la page.
        const actions = !isTrashDisplayed
            ? [
                <Button type="add" to={{ name: 'add-park' }} collapsible>
                    {__('page.parks.action-add')}
                </Button>,
                <Dropdown>
                    <Button icon="trash" onClick={handleToggleShowTrashed}>
                        {__('open-trash-bin')}
                    </Button>
                </Dropdown>,
            ]
            : [
                <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                    {__('display-not-deleted-items')}
                </Button>,
            ];

        return (
            <Page
                name="parks"
                title={title}
                help={help}
                loading={isLoading}
                actions={actions}
            >
                <div class="Parks">
                    <ServerTable
                        ref="table"
                        key={!isTrashDisplayed ? 'default' : 'trash'}
                        name={!isTrashDisplayed ? $options.name : undefined}
                        class="Parks__table"
                        columns={columns}
                        fetcher={fetch}
                    />
                </div>
            </Page>
        );
    },
});

export default Parks;
