import './index.scss';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import isTruthy from '@/utils/isTruthy';
import apiTechnicians from '@/stores/api/technicians';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';
import DatePicker from '@/themes/default/components/DatePicker';
import formatAddress from '@/utils/formatAddress';
import { confirm } from '@/utils/alert';

import type Period from '@/utils/period';
import type { ComponentRef, CreateElement } from 'vue';
import type { PaginationParams } from '@/stores/api/@types';
import type { Filters, Technician } from '@/stores/api/technicians';
import type { Columns } from '@/themes/default/components/Table/Server';

type Data = {
    isLoading: boolean,
    hasCriticalError: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
    periodForAvailabilities: Period<true> | null,
};

/** Page de listing des techniciens. */
const Technicians = defineComponent({
    name: 'Technicians',
    data: (): Data => ({
        isLoading: false,
        hasCriticalError: false,
        isTrashDisplayed: false,
        shouldDisplayTrashed: false,
        periodForAvailabilities: null,
    }),
    computed: {
        columns(): Columns<Technician> {
            const {
                $t: __,
                isTrashDisplayed,
                handleRestoreItemClick,
                handleDeleteItemClick,
            } = this;

            return [
                {
                    key: 'full_name',
                    title: `${__('first-name')} / ${__('last-name')}`,
                    class: 'Technicians__cell Technicians__cell--full-name',
                    sortable: true,
                },
                {
                    key: 'nickname',
                    title: __('nickname'),
                    class: 'Technicians__cell Technicians__cell--nickname',
                    sortable: true,
                    hidden: true,
                    render: (h: CreateElement, { nickname }: Technician) => (
                        nickname ?? (
                            <div class="Technicians__cell__empty">
                                {__('not-specified')}
                            </div>
                        )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'email',
                    title: __('email'),
                    class: 'Technicians__cell Technicians__cell--email',
                    sortable: true,
                    render: (h: CreateElement, { email }: Technician) => (
                        email !== null
                            ? <a href={`mailto:${email}`}>{email}</a>
                            : (
                                <div class="Technicians__cell__empty">
                                    {__('not-specified')}
                                </div>
                            )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'phone',
                    title: __('phone'),
                    class: 'Technicians__cell Technicians__cell--phone',
                    render: (h: CreateElement, { phone }: Technician) => (
                        phone ?? (
                            <div class="Technicians__cell__empty">
                                {__('not-specified')}
                            </div>
                        )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'address',
                    title: __('address'),
                    class: 'Technicians__cell Technicians__cell--address',
                    hidden: true,
                    render: (h: CreateElement, technician: Technician) => {
                        const address = formatAddress(
                            technician.street,
                            technician.postal_code,
                            technician.locality,
                            technician.country,
                        );
                        return address ?? (
                            <div class="Technicians__cell__empty">
                                {__('not-specified')}
                            </div>
                        );
                    },
                },
                !isTrashDisplayed && {
                    key: 'note',
                    title: __('notes'),
                    class: 'Technicians__cell Technicians__cell--note',
                    hidden: true,
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'Technicians__cell Technicians__cell--actions',
                    render: (h: CreateElement, { id }: Technician) => {
                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <Button
                                        type="restore"
                                        onClick={(e: MouseEvent) => {
                                            handleRestoreItemClick(e, id);
                                        }}
                                    />
                                    <Button
                                        type="delete"
                                        onClick={(e: MouseEvent) => {
                                            handleDeleteItemClick(e, id);
                                        }}
                                    />
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                <Button
                                    icon="eye"
                                    to={{
                                        name: 'view-technician',
                                        params: { id },
                                        hash: '#infos',
                                    }}
                                />
                                <Button
                                    icon="calendar-alt"
                                    to={{
                                        name: 'view-technician',
                                        params: { id },
                                        hash: '#schedule',
                                    }}
                                />
                                <Dropdown>
                                    <Button
                                        type="edit"
                                        to={{
                                            name: 'edit-technician',
                                            params: { id },
                                        }}
                                    >
                                        {__('action-edit')}
                                    </Button>
                                    <Button
                                        type="trash"
                                        onClick={(e: MouseEvent) => {
                                            handleDeleteItemClick(e, id);
                                        }}
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
    watch: {
        periodForAvailabilities() {
            this.refreshTable();
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

        handleRowClick({ id }: Technician) {
            this.$router.push({
                name: 'view-technician',
                params: { id: id.toString() },
            });
        },

        handleClearFilters() {
            this.periodForAvailabilities = null;
        },

        async handleDeleteItemClick(e: MouseEvent, id: Technician['id']) {
            e.stopPropagation();

            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('page.technicians.confirm-delete')
                    : __('page.technicians.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiTechnicians.remove(id);

                this.$toasted.success(__('page.technicians.deleted'));
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItemClick(e: MouseEvent, id: Technician['id']) {
            e.stopPropagation();
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                text: __('page.technicians.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiTechnicians.restore(id);

                this.$toasted.success(__('page.technicians.restored'));
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.setTablePage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination: PaginationParams) {
            this.isLoading = true;

            try {
                const filters: Filters = {};
                if (this.periodForAvailabilities !== null) {
                    filters.availabilityPeriod = this.periodForAvailabilities;
                }

                const data = await apiTechnicians.all({
                    ...pagination,
                    ...filters,
                    deleted: this.shouldDisplayTrashed,
                });

                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return { data };
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.setTablePage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving technicians:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

        refreshTable() {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.refresh();
        },

        setTablePage(page: number) {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.setPage(page);
        },
    },
    render() {
        const {
            $t: __,
            fetch,
            $options,
            columns,
            periodForAvailabilities,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleToggleShowTrashed,
            handleClearFilters,
            handleRowClick,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="technicians" title={__('page.technicians.title')} centered>
                    <CriticalError />
                </Page>
            );
        }

        if (isTrashDisplayed) {
            return (
                <Page
                    name="technicians"
                    title={__('page.technicians.title-trash')}
                    loading={isLoading}
                    actions={[
                        <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                            {__('display-not-deleted-items')}
                        </Button>,
                    ]}
                >
                    <div class="Technicians Technicians--trashed">
                        <ServerTable
                            ref="table"
                            key="trash"
                            class="Technicians__table"
                            rowClass="Technicians__row"
                            columns={columns}
                            fetcher={fetch}
                        />
                    </div>
                </Page>
            );
        }

        return (
            <Page
                name="technicians"
                title={__('page.technicians.title')}
                help={__('page.technicians.help')}
                loading={isLoading}
                actions={[
                    <Button
                        type="add"
                        icon="user-plus"
                        to={{ name: 'add-technician' }}
                        collapsible
                    >
                        {__('page.technicians.action-add')}
                    </Button>,
                    <Dropdown>
                        <Button icon="trash" onClick={handleToggleShowTrashed}>
                            {__('open-trash-bin')}
                        </Button>
                    </Dropdown>,
                ]}
            >
                <div class="Technicians">
                    <div class="Technicians__filters">
                        <DatePicker
                            type="date"
                            class="Technicians__filters__period"
                            v-model={this.periodForAvailabilities}
                            placeholder={__('page.technicians.period-of-availability')}
                            withSnippets
                            range
                        />
                        {periodForAvailabilities !== null && (
                            <Button
                                type="danger"
                                icon="backspace"
                                class="Technicians__filters__clear-button"
                                onClick={handleClearFilters}
                            >
                                {__('reset-period')}
                            </Button>
                        )}
                    </div>
                    <ServerTable
                        ref="table"
                        key="default"
                        name={$options.name}
                        class="Technicians__table"
                        rowClass="Technicians__row"
                        columns={columns}
                        fetcher={fetch}
                        onRowClick={handleRowClick}
                    />
                </div>
            </Page>
        );
    },
});

export default Technicians;
