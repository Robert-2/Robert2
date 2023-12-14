import './index.scss';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import isTruthy from '@/utils/isTruthy';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';
import Datepicker from '@/themes/default/components/Datepicker';
import formatAddress from '@/utils/formatAddress';
import { confirm } from '@/utils/alert';
import apiTechnicians from '@/stores/api/technicians';

/** Page de listing des techniciens. */
const Technicians = defineComponent({
    name: 'Technicians',
    data: () => ({
        isLoading: false,
        hasCriticalError: false,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
        periodForAvailabilities: null,
    }),
    computed: {
        columns() {
            const {
                $t: __,
                isTrashDisplayed,
                handleDeleteItem,
                handleRestoreItem,
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
                },
                !isTrashDisplayed && {
                    key: 'email',
                    title: __('email'),
                    class: 'Technicians__cell Technicians__cell--email',
                    sortable: true,
                    render: (h, { email }) => (
                        <a href={`mailto:${email}`}>{email}</a>
                    ),
                },
                !isTrashDisplayed && {
                    key: 'phone',
                    title: __('phone'),
                    class: 'Technicians__cell Technicians__cell--phone',
                },
                !isTrashDisplayed && {
                    key: 'address',
                    title: __('address'),
                    class: 'Technicians__cell Technicians__cell--address',
                    hidden: true,
                    render: (h, technician) => (
                        formatAddress(
                            technician.street,
                            technician.postal_code,
                            technician.locality,
                            technician.country,
                        )
                    ),
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
                    render: (h, { id }) => {
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
                                <Button
                                    type="edit"
                                    to={{
                                        name: 'edit-technician',
                                        params: { id },
                                    }}
                                />
                                <Button
                                    type="trash"
                                    onClick={() => { handleDeleteItem(id); }}
                                />
                            </Fragment>
                        );
                    },
                },
            ].filter(isTruthy);
        },
    },
    watch: {
        periodForAvailabilities() {
            this.$refs.table.refresh();
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

        handleRowClick({ id }) {
            this.$router.push({
                name: 'view-technician',
                params: { id },
            });
        },

        handleClearFilters() {
            this.periodForAvailabilities = null;
        },

        async handleDeleteItem(id) {
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
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItem(id) {
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
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.$refs.table.setPage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination) {
            this.isLoading = true;

            try {
                const filters = {};

                if (this.periodForAvailabilities) {
                    const [start, end] = this.periodForAvailabilities;
                    filters.availabilityPeriod = { start, end };
                }

                const data = await apiTechnicians.all({
                    ...pagination,
                    ...filters,
                    deleted: this.shouldDisplayTrashed,
                });
                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.$refs.table.setPage(1);
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
                <Page name="technicians" title={__('page.technicians.title')}>
                    <CriticalError />
                </Page>
            );
        }

        if (isTrashDisplayed) {
            return (
                <Page
                    name="technicians"
                    title={__('page.technicians.title-trash')}
                    isLoading={isLoading}
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
                isLoading={isLoading}
                actions={[
                    <Button type="add" icon="user-plus" to={{ name: 'add-technician' }}>
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
                        <Datepicker
                            class="Technicians__filters__period"
                            v-model={this.periodForAvailabilities}
                            placeholder={__('page.technicians.period-of-availability')}
                            withSnippets
                            range
                        />
                        {!!periodForAvailabilities && (
                            <Button
                                type="primary"
                                class="Technicians__filters__clear-button"
                                onClick={handleClearFilters}
                                icon="backspace"
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
