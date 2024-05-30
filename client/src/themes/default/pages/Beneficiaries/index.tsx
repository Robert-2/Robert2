import './index.scss';
import { defineComponent } from '@vue/composition-api';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import isTruthy from '@/utils/isTruthy';
import Fragment from '@/components/Fragment';
import { confirm } from '@/utils/alert';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Dropdown from '@/themes/default/components/Dropdown';
import Button from '@/themes/default/components/Button';
import Link from '@/themes/default/components/Link';

import type { ComponentRef, CreateElement } from 'vue';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Columns } from '@/themes/default/components/Table/Server';
import type { ListingParams } from '@/stores/api/@types';

type Data = {
    isLoading: boolean,
    hasCriticalError: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
};

/* Page de listing des bénéficiaires. */
const Beneficiaries = defineComponent({
    name: 'Beneficiaries',
    data: (): Data => ({
        isLoading: false,
        hasCriticalError: false,
        shouldDisplayTrashed: false,
        isTrashDisplayed: false,
    }),
    computed: {
        columns(): Columns<Beneficiary> {
            const { $t: __, isTrashDisplayed, handleDeleteItemClick, handleRestoreItemClick } = this;

            return [
                {
                    key: 'full_name',
                    title: `${__('first-name')} / ${__('last-name')}`,
                    class: 'Beneficiaries__cell Beneficiaries__cell--full-name',
                    sortable: true,
                },
                {
                    key: 'reference',
                    title: __('reference'),
                    class: 'Beneficiaries__cell Beneficiaries__cell--reference',
                    sortable: true,
                    hidden: true,
                    render: (h: CreateElement, { reference }: Beneficiary) => (
                        reference ?? (
                            <span class="Beneficiaries__cell__empty">
                                {__('not-specified')}
                            </span>
                        )
                    ),
                },
                {
                    key: 'company',
                    title: __('company'),
                    class: 'Beneficiaries__cell Beneficiaries__cell--company',
                    sortable: true,
                    render: (h: CreateElement, { company }: Beneficiary) => {
                        if (!company) {
                            return (
                                <span class="Beneficiaries__cell__empty">
                                    {__('not-specified')}
                                </span>
                            );
                        }

                        return (
                            <Link to={{ name: 'edit-company', params: { id: company.id } }}>
                                {company.legal_name}
                            </Link>
                        );
                    },
                },
                !isTrashDisplayed && {
                    key: 'email',
                    title: __('email'),
                    class: 'Beneficiaries__cell Beneficiaries__cell--email',
                    sortable: true,
                    render: (h: CreateElement, { email }: Beneficiary) => (
                        email !== null
                            ? <a href={`mailto:${email}`}>{email}</a>
                            : (
                                <span class="Beneficiaries__cell__empty">
                                    {__('not-specified')}
                                </span>
                            )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'phone',
                    title: __('phone'),
                    class: 'Beneficiaries__cell Beneficiaries__cell--phone',
                    render: (h: CreateElement, beneficiary: Beneficiary) => {
                        const phones: string[] = [
                            (beneficiary.phone ?? '').length > 0 && (
                                beneficiary.phone!
                            ),
                            (beneficiary.company?.phone ?? '').length > 0 && (
                                beneficiary.company!.phone!
                            ),
                        ].filter(Boolean) as string[];

                        return phones.length > 0
                            ? phones.map((phone: string, index: number) => (
                                <div key={index}>{phone}</div>
                            ))
                            : (
                                <span class="Beneficiaries__cell__empty">
                                    {__('not-specified')}
                                </span>
                            );
                    },
                },
                !isTrashDisplayed && {
                    key: 'address',
                    title: __('address'),
                    hidden: true,
                    class: 'Beneficiaries__cell Beneficiaries__cell--address',
                    render: (h: CreateElement, beneficiary: Beneficiary) => {
                        const address = beneficiary.company?.full_address || beneficiary.full_address || '';
                        return address.length > 0 ? address : (
                            <span class="Beneficiaries__cell__empty">
                                {__('not-specified')}
                            </span>
                        );
                    },
                },
                !isTrashDisplayed && {
                    key: 'note',
                    title: __('notes'),
                    class: 'Beneficiaries__cell Beneficiaries__cell--note',
                    hidden: true,
                    render: (h: CreateElement, beneficiary: Beneficiary) => (
                        beneficiary.company
                            ? beneficiary.company.note
                            : beneficiary.note
                    ),
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'Beneficiaries__cell Beneficiaries__cell--actions',
                    render: (h: CreateElement, { id }: Beneficiary) => {
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
                                    to={{ name: 'view-beneficiary', params: { id } }}
                                />
                                <Dropdown>
                                    <Button
                                        type="edit"
                                        to={{
                                            name: 'edit-beneficiary',
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

        async handleDeleteItemClick(e: MouseEvent, id: Beneficiary['id']) {
            e.stopPropagation();

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

                this.$toasted.success(__('page.beneficiaries.deleted'));
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItemClick(e: MouseEvent, id: Beneficiary['id']) {
            e.stopPropagation();
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

                this.$toasted.success(__('page.beneficiaries.restored'));
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleRowClick({ id }: Beneficiary) {
            this.$router.push({
                name: 'view-beneficiary',
                params: { id: id.toString() },
            });
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

        async fetch(params: ListingParams) {
            this.isLoading = true;

            try {
                const data = await apiBeneficiaries.all({
                    ...params,
                    deleted: this.shouldDisplayTrashed,
                });

                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.setTablePage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving beneficiaries:`, error);
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
            isLoading,
            isTrashDisplayed,
            hasCriticalError,
            handleToggleShowTrashed,
            handleRowClick,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="beneficiaries" title={__('page.beneficiaries.title')} centered>
                    <CriticalError />
                </Page>
            );
        }

        if (isTrashDisplayed) {
            return (
                <Page
                    name="beneficiaries"
                    title={__('page.beneficiaries.title-trash')}
                    loading={isLoading}
                    actions={[
                        <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                            {__('display-not-deleted-items')}
                        </Button>,
                    ]}
                >
                    <div class="Beneficiaries Beneficiaries--trashed">
                        <ServerTable
                            ref="table"
                            key="trash"
                            rowClass="Beneficiaries__row"
                            columns={columns}
                            fetcher={fetch}
                        />
                    </div>
                </Page>
            );
        }

        return (
            <Page
                name="beneficiaries"
                title={__('page.beneficiaries.title')}
                help={__('page.beneficiaries.help')}
                loading={isLoading}
                actions={[
                    <Button
                        type="add"
                        icon="user-plus"
                        to={{ name: 'add-beneficiary' }}
                        collapsible
                    >
                        {__('page.beneficiaries.action-add')}
                    </Button>,
                    <Dropdown>
                        <Button icon="trash" onClick={handleToggleShowTrashed}>
                            {__('open-trash-bin')}
                        </Button>
                    </Dropdown>,
                ]}
            >
                <div class="Beneficiaries">
                    <ServerTable
                        ref="table"
                        key="default"
                        name={$options.name}
                        class="Beneficiaries__table"
                        rowClass="Beneficiaries__row"
                        columns={columns}
                        fetcher={fetch}
                        onRowClick={handleRowClick}
                    />
                </div>
            </Page>
        );
    },
});

export default Beneficiaries;
