import './index.scss';
import Page from '@/themes/default/components/Page';
import Fragment from '@/components/Fragment';
import CriticalError from '@/themes/default/components/CriticalError';
import Button from '@/themes/default/components/Button';
import formatAddress from '@/utils/formatAddress';
import ItemsCount from './components/ItemsCount';
import TotalAmount from './components/TotalAmount';
import apiParks from '@/stores/api/parks';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';
import initColumnsDisplay from '@/utils/initColumnsDisplay';

// @vue/component
export default {
    name: 'Parks',
    data() {
        const { $t: __, $options } = this;

        return {
            hasCriticalError: false,
            isLoading: false,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,

            //
            // - Tableau
            //

            columns: [
                'name',
                'address',
                'opening_hours',
                'totalItems',
                'note',
                'totalAmount',
                'events',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                saveState: true,
                orderBy: { column: 'name', ascending: true },
                sortable: ['name'],
                columnsDisplay: initColumnsDisplay($options.name, {
                    name: true,
                    address: true,
                    opening_hours: true,
                    totalItems: true,
                    note: false,
                    totalAmount: true,
                    events: true,
                }),
                headings: {
                    name: __('name'),
                    address: __('address'),
                    opening_hours: __('opening-hours'),
                    totalItems: __('page.parks.total-items'),
                    note: __('notes'),
                    totalAmount: __('total-value'),
                    events: __('events'),
                    actions: '',
                },
                columnsClasses: {
                    address: 'Parks__address ',
                    opening_hours: 'Parks__opening-hours ',
                    note: 'Parks__note ',
                    totalAmount: 'Parks__total-amount ',
                    events: 'Parks__events ',
                    actions: 'Parks__actions ',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    address: (h, park) => (
                        formatAddress(park.street, park.postal_code, park.locality)
                    ),
                    totalItems: (h, park) => (
                        <ItemsCount park={park} />
                    ),
                    totalAmount: (h, park) => (
                        <TotalAmount park={park} />
                    ),
                    events: (h, { id, total_items: itemsCount }) => {
                        if (itemsCount === 0) {
                            return null;
                        }

                        return (
                            <router-link to={{ name: 'calendar', query: { park: id } }}>
                                {__('page.parks.display-events-for-park')}
                            </router-link>
                        );
                    },
                    actions: (h, { id, total_items: itemsCount }) => {
                        const {
                            isTrashDisplayed,
                            handleDeleteItem,
                            handleRestoreItem,
                        } = this;

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
                                <Button
                                    type="edit"
                                    to={{ name: 'edit-park', params: { id } }}
                                />
                                <Button
                                    type="trash"
                                    onClick={() => { handleDeleteItem(id); }}
                                    disabled={hasItems}
                                />
                            </Fragment>
                        );
                    },
                },
            },
        };
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleDeleteItem(id) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page.parks.confirm-delete')
                    : __('page.parks.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiParks.remove(id);
                this.$refs.table.refresh();
                this.$store.dispatch('parks/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItem(id) {
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                type: 'restore',
                text: __('page.parks.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiParks.restore(id);
                this.$refs.table.refresh();
                this.$store.dispatch('parks/refresh');
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.$refs.table.setPage(1);
            this.$refs.table.refresh();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination) {
            this.isLoading = true;

            try {
                const data = await apiParks.all({
                    ...pagination,
                    deleted: this.shouldDisplayTrashed,
                });
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },
    },
    render() {
        const {
            $t: __,
            $options,
            columns,
            options,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleShowTrashed,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="parks" title={__('page.parks.title')}>
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page
                name="parks"
                title={__('page.parks.title')}
                help={__('page.parks.help')}
                isLoading={isLoading}
                actions={[
                    <Button type="add" to={{ name: 'add-park' }}>
                        {__('page.parks.action-add')}
                    </Button>,
                ]}
            >
                <div class="Parks">
                    <v-server-table
                        ref="table"
                        class="Parks__table"
                        name={$options.name}
                        columns={columns}
                        options={options}
                    />
                    <div class="content__footer">
                        <Button
                            onClick={handleShowTrashed}
                            icon={isTrashDisplayed ? 'eye' : 'trash'}
                            type={isTrashDisplayed ? 'success' : 'danger'}
                        >
                            {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                        </Button>
                    </div>
                </div>
            </Page>
        );
    },
};
