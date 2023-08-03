import './index.scss';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import Fragment from '@/components/Fragment';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Button from '@/themes/default/components/Button';
import { confirm } from '@/utils/alert';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import initColumnsDisplay from '@/utils/initColumnsDisplay';

// @vue/component
export default {
    name: 'Beneficiaries',
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
                'full_name',
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
                orderBy: { column: 'full_name', ascending: true },
                sortable: ['full_name', 'reference', 'company', 'email'],
                columnsDisplay: initColumnsDisplay($options.name, {
                    full_name: true,
                    reference: true,
                    company: true,
                    email: true,
                    phone: true,
                    address: true,
                    note: false,
                }),
                headings: {
                    full_name: `${__('first-name')} / ${__('last-name')}`,
                    reference: __('reference'),
                    company: __('company'),
                    email: __('email'),
                    phone: __('phone'),
                    address: __('address'),
                    note: __('notes'),
                    actions: '',
                },
                columnsClasses: {
                    company: 'Beneficiaries__company ',
                    email: 'Beneficiaries__email ',
                    address: 'Beneficiaries__address ',
                    note: 'Beneficiaries__note ',
                    actions: 'Beneficiaries__actions ',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    company: (h, { company }) => {
                        if (!company) {
                            return null;
                        }

                        return (
                            <router-link to={{ name: 'edit-company', params: { id: company.id } }}>
                                {company.legal_name}
                            </router-link>
                        );
                    },
                    email: (h, { email }) => (
                        <a href={`mailto:${email}`}>{email}</a>
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
                        beneficiary.company
                            ? beneficiary.company.note
                            : beneficiary.note
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
                                    type="edit"
                                    to={{
                                        name: 'edit-beneficiary',
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
                type: 'danger',
                text: isSoft
                    ? __('page.beneficiaries.confirm-delete')
                    : __('page.beneficiaries.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiBeneficiaries.remove(id);
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
                text: __('page.beneficiaries.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiBeneficiaries.restore(id);
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
                const data = await apiBeneficiaries.all({
                    ...pagination,
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
                console.error(`Error ocurred while retrieving beneficiaries:`, error);
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
                <Page name="beneficiaries" title={__('page.beneficiaries.title')}>
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page
                name="beneficiaries"
                title={__('page.beneficiaries.title')}
                help={__('page.beneficiaries.help')}
                isLoading={isLoading}
                actions={[
                    <Button type="add" icon="user-plus" to={{ name: 'add-beneficiary' }}>
                        {__('page.beneficiaries.action-add')}
                    </Button>,
                ]}
            >
                <div class="Beneficiaries">
                    <v-server-table
                        ref="table"
                        class="Beneficiaries__table"
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
