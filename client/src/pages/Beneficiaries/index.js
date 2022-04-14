import './index.scss';
import { Fragment } from 'vue-fragment';
import initColumnsDisplay from '@/utils/initColumnsDisplay';
import { confirm } from '@/utils/alert';
import Config from '@/globals/config';
import Page from '@/components/Page';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'Beneficiaries',
    data() {
        const { $t: __, $route, $options } = this;

        return {
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            columns: [
                'last_name',
                'first_name',
                'reference',
                'company',
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
                orderBy: { column: 'last_name', ascending: true },
                initialPage: $route.query.page || 1,
                sortable: ['last_name', 'first_name', 'reference', 'company', 'email'],
                columnsDisplay: initColumnsDisplay($options.name, {
                    last_name: true,
                    first_name: true,
                    reference: true,
                    company: true,
                    email: true,
                    phone: true,
                    address: true,
                    note: false,
                }),
                headings: {
                    last_name: __('last-name'),
                    first_name: __('first-name'),
                    reference: __('reference'),
                    company: __('company'),
                    email: __('email'),
                    phone: __('phone'),
                    address: __('address'),
                    note: __('notes'),
                    actions: '',
                },
                columnsClasses: {
                    company: 'Beneficiaries__company',
                    email: 'Beneficiaries__email',
                    address: 'Beneficiaries__address',
                    note: 'Beneficiaries__note',
                    actions: 'Beneficiaries__actions',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    company: (h, beneficiary) => {
                        if (!beneficiary.company) {
                            return null;
                        }

                        return (
                            <router-link
                                v-tooltip={__('action-edit')}
                                to={`/companies/${beneficiary.company.id}`}
                            >
                                {beneficiary.company.legal_name}{' '}
                                <i class="fas fa-edit" />
                            </router-link>
                        );
                    },
                    email: (h, beneficiary) => (
                        <a href={`mailto:${beneficiary.email}`}>
                            {beneficiary.email}
                        </a>
                    ),
                    phone: (h, beneficiary) => (
                        <Fragment>
                            {!!beneficiary.phone && <div>{beneficiary.phone}</div>}
                            {!!beneficiary.company && <div>{beneficiary.company.phone}</div>}
                        </Fragment>
                    ),
                    address: (h, beneficiary) => (
                        beneficiary.company?.full_address || beneficiary.full_address || ''
                    ),
                    note: (h, beneficiary) => (
                        beneficiary.company ? beneficiary.company.note : beneficiary.note
                    ),
                    actions: (h, beneficiary) => {
                        const {
                            isTrashDisplayed,
                            deleteBeneficiary,
                            restoreBeneficiary,
                        } = this;

                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <button
                                        type="button"
                                        v-tooltip={__('action-restore')}
                                        class="item-actions__button info"
                                        onClick={() => { restoreBeneficiary(beneficiary.id); }}
                                    >
                                        <i class="fas fa-trash-restore" />
                                    </button>
                                    <button
                                        type="button"
                                        v-tooltip={__('action-delete')}
                                        class="item-actions__button danger"
                                        onClick={() => { deleteBeneficiary(beneficiary.id); }}
                                    >
                                        <i class="fas fa-trash-alt" />
                                    </button>
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                <router-link
                                    v-tooltip={__('action-edit')}
                                    to={`/beneficiaries/${beneficiary.id}`}
                                    custom
                                >
                                    {({ navigate }) => (
                                        <button
                                            type="button"
                                            class="item-actions__button info"
                                            onClick={navigate}
                                        >
                                            <i class="fas fa-edit" />
                                        </button>
                                    )}
                                </router-link>
                                <button
                                    type="button"
                                    v-tooltip={__('action-trash')}
                                    class="item-actions__button warning"
                                    onClick={() => { deleteBeneficiary(beneficiary.id); }}
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
    methods: {
        async fetch(pagination) {
            this.isLoading = true;
            this.error = null;

            try {
                const params = {
                    ...pagination,
                    tags: [Config.beneficiaryTagName],
                    deleted: this.isDisplayTrashed ? '1' : '0',
                };
                return await this.$http.get('persons', { params });
            } catch (error) {
                this.error = error;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }

            return undefined;
        },

        async deleteBeneficiary(beneficiaryId) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page-beneficiaries.confirm-delete')
                    : __('page-beneficiaries.confirm-permanently-delete'),

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
                await this.$http.delete(`persons/${beneficiaryId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restoreBeneficiary(beneficiaryId) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-beneficiaries.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`persons/restore/${beneficiaryId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        refreshTable() {
            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.refresh();
        },

        showTrashed() {
            this.isDisplayTrashed = !this.isDisplayTrashed;
            this.refreshTable();
        },
    },
    render() {
        const {
            $t: __,
            $options,
            error,
            isLoading,
            columns,
            options,
            showTrashed,
            isTrashDisplayed,
        } = this;

        const headerActions = [
            <Button icon="user-plus" type="success" to="/beneficiaries/new">
                {__('page-beneficiaries.action-add')}
            </Button>,
        ];

        return (
            <Page
                name="beneficiaries"
                class="Beneficiaries"
                title={__('page-beneficiaries.title')}
                help={__('page-beneficiaries.help')}
                error={error}
                isLoading={isLoading}
                actions={headerActions}
            >
                <v-server-table
                    ref="DataTable"
                    name={$options.name}
                    columns={columns}
                    options={options}
                />
                <div class="content__footer">
                    <Button
                        onClick={showTrashed}
                        icon={isTrashDisplayed ? 'eye' : 'trash'}
                        type={isTrashDisplayed ? 'success' : 'danger'}
                    >
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </Button>
                </div>
            </Page>
        );
    },
};
