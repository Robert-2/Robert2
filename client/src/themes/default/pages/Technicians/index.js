import './index.scss';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Button from '@/themes/default/components/Button';
import Datepicker from '@/themes/default/components/Datepicker';
import formatAddress from '@/utils/formatAddress';
import { confirm } from '@/utils/alert';
import apiTechnicians from '@/stores/api/technicians';
import initColumnsDisplay from '@/utils/initColumnsDisplay';

// @vue/component
export default {
    name: 'Technicians',
    data() {
        const { $t: __, $options } = this;

        return {
            hasCriticalError: false,
            isLoading: false,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,
            periodFilter: null,

            //
            // - Tableau
            //

            columns: [
                'full_name',
                'nickname',
                'email',
                'phone',
                'address',
                'note',
                'actions',
            ],
            options: {
                columnsDropdown: true,
                preserveState: true,
                saveState: true,
                orderBy: { column: 'full_name', ascending: true },
                sortable: ['full_name', 'nickname', 'email'],
                columnsDisplay: initColumnsDisplay($options.name, {
                    full_name: true,
                    nickname: true,
                    email: true,
                    phone: true,
                    address: true,
                    note: false,
                }),
                headings: {
                    full_name: `${__('first-name')} / ${__('last-name')}`,
                    nickname: __('nickname'),
                    email: __('email'),
                    phone: __('phone'),
                    address: __('address'),
                    note: __('notes'),
                    actions: '',
                },
                columnsClasses: {
                    nickname: 'Technicians__nickname ',
                    email: 'Technicians__email ',
                    address: 'Technicians__address ',
                    note: 'Technicians__note ',
                    actions: 'Technicians__actions ',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    full_name: (h, { id, full_name: fullName }) => {
                        if (this.isTrashDisplayed) {
                            return fullName;
                        }

                        return (
                            <router-link
                                to={{ name: 'view-technician', params: { id } }}
                                class="Technicians__link"
                            >
                                {fullName}
                            </router-link>
                        );
                    },
                    nickname: (h, { id, nickname }) => {
                        if (this.isTrashDisplayed) {
                            return nickname;
                        }

                        return (
                            <router-link
                                to={{ name: 'view-technician', params: { id } }}
                                class="Technicians__link"
                            >
                                {nickname}
                            </router-link>
                        );
                    },
                    email: (h, { email }) => (
                        <a href={`mailto:${email}`}>{email}</a>
                    ),
                    address: (h, technician) => (
                        formatAddress(
                            technician.street,
                            technician.postal_code,
                            technician.locality,
                            technician.country,
                        )
                    ),
                    actions: (h, { id }) => {
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
            },
        };
    },
    watch: {
        periodFilter() {
            this.$refs.table.refresh();
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClearFilters() {
            this.periodFilter = null;
        },

        async handleDeleteItem(id) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page.technicians.confirm-delete')
                    : __('page.technicians.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
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
                type: 'restore',
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

        handleShowTrashed() {
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
                if (this.periodFilter) {
                    const [start, end] = this.periodFilter;
                    filters.startDate = moment(start).format();
                    filters.endDate = moment(end).endOf('day').format();
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
                console.error(`Error ocurred while retrieving technicians:`, error);
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
            periodFilter,
            handleClearFilters,
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleShowTrashed,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="technicians" title={__('page.technicians.title')}>
                    <CriticalError />
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
                ]}
            >
                <div class="Technicians">
                    <div class="Technicians__filters">
                        <Datepicker
                            class="Technicians__filters__period"
                            v-model={this.periodFilter}
                            placeholder={__('page.technicians.period-of-availability')}
                            range
                        />
                        {!!periodFilter && (
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
                    <v-server-table
                        ref="table"
                        class="Technicians__table"
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
