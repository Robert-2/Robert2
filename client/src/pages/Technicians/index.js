import './index.scss';
import moment from 'moment';
import { confirm } from '@/utils/alert';
import Page from '@/components/Page';
import Datepicker from '@/components/Datepicker';
import ItemActions from './Actions';

// @vue/component
export default {
    name: 'Technicians',
    data() {
        return {
            help: 'page-technicians.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            periodFilter: null,
            columns: [
                'last_name',
                'first_name',
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
                orderBy: { column: 'last_name', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['last_name', 'first_name', 'nickname', 'email'],
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    note: 'mobile',
                },
                headings: {
                    last_name: this.$t('last-name'),
                    first_name: this.$t('first-name'),
                    nickname: this.$t('nickname'),
                    email: this.$t('email'),
                    phone: this.$t('phone'),
                    address: this.$t('address'),
                    note: this.$t('notes'),
                    actions: '',
                },
                columnsClasses: {
                    nickname: 'Technicians__nickname',
                    email: 'Technicians__email',
                    address: 'Technicians__address',
                    note: 'Technicians__note',
                    actions: 'Technicians__actions',
                },
                requestFunction: this.fetch.bind(this),
            },
        };
    },
    watch: {
        periodFilter() {
            this.refreshTable();
        },
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
                if (this.periodFilter) {
                    const [start, end] = this.periodFilter;
                    params.startDate = moment(start).format();
                    params.endDate = moment(end).endOf('day').format();
                }
                return await this.$http.get('technicians', { params });
            } catch (error) {
                this.error = error;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }

            return undefined;
        },

        async deleteTechnician(id) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page-technicians.confirm-delete')
                    : __('page-technicians.confirm-permanently-delete'),

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
                await this.$http.delete(`persons/${id}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restoreTechnician(id) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-technicians.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`persons/restore/${id}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        refreshTable() {
            this.help = 'page-technicians.help';
            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.refresh();
        },

        clearFilters() {
            this.periodFilter = null;
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
            restoreTechnician,
            deleteTechnician,
            periodFilter,
            clearFilters,
            isTrashDisplayed,
            showTrashed,
        } = this;

        const headerActions = [
            <router-link to="/technicians/new" class="button success">
                <i class="fas fa-user-plus" /> {__('page-technicians.action-add')}
            </router-link>,
        ];

        return (
            <Page
                name="technicians"
                title={__('page-technicians.title')}
                help={__(help)}
                error={error}
                isLoading={isLoading}
                actions={headerActions}
            >
                <div class="Technicians__filters">
                    <Datepicker
                        v-model={this.periodFilter}
                        isRange
                        placeholder={__('page-technicians.period-of-availability')}
                    />
                    {periodFilter && (
                        <button
                            type="button"
                            class="Technicians__filters__clear-button warning"
                            v-tooltip={__('clear-filters')}
                            onClick={clearFilters}
                        >
                            <i class="fas fa-backspace" />
                        </button>
                    )}
                </div>
                <v-server-table
                    ref="DataTable"
                    name="techniciansTable"
                    columns={columns}
                    options={options}
                    scopedSlots={{
                        email: ({ row }) => (
                            <a href={`mailto:${row.email}`}>{row.email}</a>
                        ),
                        address: ({ row }) => (
                            <div>
                                {row.street}<br />
                                {row.postal_code} {row.locality}
                            </div>
                        ),
                        actions: ({ row }) => (
                            <ItemActions
                                isTrashMode={isTrashDisplayed}
                                id={row.id}
                                onRemove={deleteTechnician}
                                onRestore={restoreTechnician}
                            />
                        ),
                    }}
                />
                <div class="content__footer">
                    <button
                        type="button"
                        class={isTrashDisplayed ? 'info' : 'warning'}
                        onClick={showTrashed}
                    >
                        <i class={['fas', { 'fa-trash': !isTrashDisplayed, 'fa-eye"': isTrashDisplayed }]} />{' '}
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </button>
                </div>
            </Page>
        );
    },
};
