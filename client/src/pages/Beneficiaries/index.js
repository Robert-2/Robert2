import './index.scss';
import { Fragment } from 'vue-fragment';
import Config from '@/globals/config';
import Page from '@/components/Page';
import Alert from '@/components/Alert';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'Beneficiaries',
    data() {
        const { $t: __ } = this;

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
                orderBy: { column: 'last_name', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: ['last_name', 'first_name', 'reference', 'company', 'email'],
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    note: 'mobile',
                },
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
                    actions: 'VueTables__actions Beneficiaries__actions',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    company: (h, beneficiary) => {
                        if (!beneficiary.company) {
                            return null;
                        }

                        return (
                            <router-link
                                vTooltip={__('action-edit')}
                                to={`/companies/${beneficiary.company.id}`}
                            >
                                {beneficiary.company.legal_name}
                                <i class="fas fa-edit" />
                            </router-link>
                        );
                    },
                    email: (h, beneficiary) => (
                        <a href={`mailto:${beneficiary.email}`}>
                            {beneficiary.email}
                        </a>
                    ),
                    phone(h, beneficiary) {
                        return (
                            <Fragment>
                                {!!beneficiary.phone && <div>{beneficiary.phone}</div>}
                                {!!beneficiary.company && <div>{beneficiary.company.phone}</div>}
                            </Fragment>
                        );
                    },
                    address: (h, beneficiary) => (
                        this.getBeneficiaryAddress(beneficiary)
                    ),
                    note: (h, beneficiary) => {
                        const note = beneficiary.company
                            ? beneficiary.company.note
                            : beneficiary.note;

                        return <pre>{note}</pre>;
                    },
                    actions: (h, beneficiary) => {
                        const {
                            isTrashDisplayed,
                            deleteBeneficiary,
                            restoreBeneficiary,
                        } = this;

                        if (!isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <router-link
                                        vTooltip={__('action-edit')}
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
                                        vTooltip={__('action-trash')}
                                        class="item-actions__button warning"
                                        onClick={() => { deleteBeneficiary(beneficiary.id); }}
                                    >
                                        <i class="fas fa-trash" />
                                    </button>
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                <button
                                    type="button"
                                    vTooltip={__('action-restore')}
                                    class="item-actions__button info"
                                    onClick={() => { restoreBeneficiary(beneficiary.id); }}
                                >
                                    <i class="fas fa-trash-restore" />
                                </button>
                                <button
                                    type="button"
                                    vTooltip={__('action-delete')}
                                    class="item-actions__button danger"
                                    onClick={() => { deleteBeneficiary(beneficiary.id); }}
                                >
                                    <i class="fas fa-trash-alt" />
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
                this.showError(error);
                return undefined;
            } finally {
                this.isTrashDisplayed = this.isDisplayTrashed;
                this.isLoading = false;
            }
        },

        getBeneficiaryAddress(beneficiary) {
            const formatAddress = ({ street, postal_code: postalCode, locality }) => {
                const localityFull = [postalCode, locality].filter(Boolean).join(' ');

                return [street, localityFull]
                    .map((value) => (value ? value.trim() : value))
                    .filter(Boolean)
                    .join('\n');
            };

            if (beneficiary.street || beneficiary.postal_code || beneficiary.locality) {
                return formatAddress(beneficiary);
            }

            return formatAddress(beneficiary.company || {});
        },

        deleteBeneficiary(beneficiaryId) {
            const isSoft = !this.isTrashDisplayed;
            Alert.ConfirmDelete(this.$t, 'beneficiaries', isSoft).then((result) => {
                if (!result.value) {
                    return;
                }

                this.error = null;
                this.isLoading = true;
                this.$http.delete(`persons/${beneficiaryId}`)
                    .then(this.refreshTable)
                    .catch(this.showError);
            });
        },

        restoreBeneficiary(beneficiaryId) {
            Alert.ConfirmRestore(this.$t, 'beneficiaries').then((result) => {
                if (!result.value) {
                    return;
                }

                this.error = null;
                this.isLoading = true;
                this.$http.put(`persons/restore/${beneficiaryId}`)
                    .then(this.refreshTable)
                    .catch(this.showError);
            });
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

        showError(error) {
            this.isLoading = false;
            this.error = error;
        },
    },
    render() {
        const {
            $t: __,
            error,
            isLoading,
            columns,
            options,
            showTrashed,
            isTrashDisplayed,
        } = this;

        const headerActions = [
            <Button
                onClick={showTrashed}
                icon={isTrashDisplayed ? 'eye' : 'trash'}
                class="Beneficiaries__show-trashed"
            >
                {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
            </Button>,
            <router-link to="/beneficiaries/new" custom>
                {({ navigate }) => (
                    <Button
                        onClick={navigate}
                        icon="user-plus"
                        class="Beneficiaries__create success"
                    >
                        {__('page-beneficiaries.action-add')}
                    </Button>
                )}
            </router-link>,
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
                    name="BeneficiariesTable"
                    columns={columns}
                    options={options}
                />
            </Page>
        );
    },
};
