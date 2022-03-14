import './index.scss';
import { Fragment } from 'vue-fragment';
import { confirm } from '@/utils/alert';
import Config from '@/globals/config';
import Help from '@/components/Help';
import ParkTotalAmount from '@/components/ParkTotalAmount';

// @vue/component
export default {
    name: 'Parks',
    data() {
        const { $t: __ } = this;

        return {
            help: 'page-parks.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            columns: [
                'name',
                'address',
                'opening_hours',
                'totalItems',
                'totalAmount',
                'note',
                'events',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                orderBy: { column: 'name', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['name'],
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    note: 'mobile',
                    totalAmount: 'desktop',
                    events: 'desktop',
                },
                headings: {
                    name: __('name'),
                    address: __('address'),
                    opening_hours: __('opening-hours'),
                    totalItems: __('page-parks.total-items'),
                    totalAmount: __('total-amount'),
                    note: __('notes'),
                    events: '',
                    actions: '',
                },
                columnsClasses: {
                    address: 'Parks__address',
                    opening_hours: 'Parks__opening-hours',
                    totalAmount: 'Parks__total-amount',
                    note: 'Parks__note',
                    events: 'Parks__events',
                    actions: 'Parks__actions',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    address: (h, park) => (
                        <Fragment>
                            {park.street}<br />
                            {park.postal_code} {park.locality}
                        </Fragment>
                    ),
                    totalItems: (h, park) => {
                        const hasItems = park.total_items > 0;
                        if (!hasItems) {
                            return (
                                <span v-else class="Parks__no-items">
                                    {__('no-items')}
                                </span>
                            );
                        }

                        return (
                            <Fragment>
                                <router-link
                                    vTooltip={__('page-parks.display-materials-of-this-park')}
                                    to={`/materials?park=${park.id}`}
                                >
                                    {__('items-count', { count: park.total_items }, park.total_items)}
                                </router-link>
                                <span class="Parks__total-stock">
                                    ({__('stock-items-count', { count: park.total_stock_quantity })})
                                </span>
                            </Fragment>
                        );
                    },
                    totalAmount: (h, park) => {
                        const hasItems = park.total_items > 0;
                        if (!hasItems) {
                            return null;
                        }
                        return <ParkTotalAmount parkId={park.id} />;
                    },
                    note: (h, park) => <pre>{park.note}</pre>,
                    events: (h, park) => {
                        const { parksCount } = this;
                        const hasItems = park.total_items > 0;
                        if (parksCount <= 1 || !hasItems) {
                            return null;
                        }

                        return (
                            <router-link to={`/?park=${park.id}`}>
                                {__('page-parks.display-events-for-park')}
                            </router-link>
                        );
                    },
                    actions: (h, park) => {
                        const {
                            isTrashDisplayed,
                            getDownloadListingUrl,
                            restorePark,
                            deletePark,
                        } = this;

                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <button
                                        type="button"
                                        vTooltip={__('action-restore')}
                                        class="item-actions__button info"
                                        onClick={() => { restorePark(park.id); }}
                                    >
                                        <i class="fas fa-trash-restore" />
                                    </button>
                                    <button
                                        type="button"
                                        vTooltip={__('action-delete')}
                                        class="item-actions__button danger"
                                        onClick={() => { deletePark(park.id); }}
                                    >
                                        <i class="fas fa-trash-alt" />
                                    </button>
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                {park.total_stock_quantity > 0 && (
                                    <a
                                        rel="noreferrer"
                                        target="_blank"
                                        class="button item-actions__button Parks__print-button"
                                        vTooltip={__('page-parks.print-materials-of-this-park')}
                                        href={getDownloadListingUrl(park.id)}
                                    >
                                        <i class="fas fa-clipboard-list" />
                                    </a>
                                )}
                                <router-link to={`/parks/${park.id}`} custom>
                                    {({ navigate }) => (
                                        <button
                                            type="button"
                                            vTooltip={__('action-edit')}
                                            class="item-actions__button info"
                                            onClick={navigate}
                                        >
                                            <i class="fas fa-edit" />
                                        </button>
                                    )}
                                </router-link>
                                <button
                                    type="button"
                                    vTooltip={__('action-trash')}
                                    class="item-actions__button warning"
                                    onClick={() => { deletePark(park.id); }}
                                >
                                    <i class="fas fa-trash" />
                                </button>
                            </Fragment>
                        );
                    },
                },
            },
        };
    },
    computed: {
        parksCount() {
            return this.$store.state.parks.list.length;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        async fetch(pagination) {
            this.error = null;
            this.isLoading = true;

            try {
                const params = {
                    ...pagination,
                    deleted: this.isDisplayTrashed ? '1' : '0',
                };
                return await this.$http.get('parks', { params });
            } catch (error) {
                this.error = error;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }

            return undefined;
        },

        async deletePark(parkId) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page-parks.confirm-delete')
                    : __('page-parks.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.delete(`parks/${parkId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restorePark(parkId) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-parks.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`parks/restore/${parkId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        getDownloadListingUrl(parkId) {
            const { baseUrl } = Config;
            return `${baseUrl}/materials/pdf?park=${parkId}`;
        },

        refreshTable() {
            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.refresh();
            this.$store.dispatch('parks/refresh');
        },

        showTrashed() {
            this.isDisplayTrashed = !this.isDisplayTrashed;
            this.refreshTable();
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            isLoading,
            columns,
            options,
            isTrashDisplayed,
            showTrashed,
        } = this;

        return (
            <div class="content Parks">
                <div class="content__header header-page">
                    <div class="header-page__help">
                        <Help message={help} error={error} isLoading={isLoading} />
                    </div>
                    <div class="header-page__actions">
                        <router-link to="/parks/new" custom>
                            {({ navigate }) => (
                                <button type="button" onClick={navigate} class="success">
                                    <i class="fas fa-plus" />{' '}
                                    {__('page-parks.action-add')}
                                </button>
                            )}
                        </router-link>
                    </div>
                </div>
                <div class="content__main-view">
                    <v-server-table
                        ref="DataTable"
                        name="ParksTable"
                        columns={columns}
                        options={options}
                    />
                </div>
                <div class="content__footer">
                    <button
                        type="button"
                        onClick={showTrashed}
                        class={[
                            'Parks__show-trashed',
                            isTrashDisplayed ? 'info' : 'warning',
                        ]}
                    >
                        <i class={['fas', isTrashDisplayed ? 'fa-eye' : 'fa-trash']} />{' '}
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </button>
                </div>
            </div>
        );
    },
};
