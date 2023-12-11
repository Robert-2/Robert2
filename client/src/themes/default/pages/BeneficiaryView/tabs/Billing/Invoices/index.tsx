import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import Decimal from 'decimal.js';
import formatAmount from '@/utils/formatAmount';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Button from '@/themes/default/components/Button';
import Fragment from '@/components/Fragment';

import type { PropType } from '@vue/composition-api';
import type { CreateElement } from 'vue';
import type { Invoice } from '@/stores/api/invoices';

type Props = {
    /* Liste de factures. */
    invoices: Invoice[],
};

type Data = {
    columns: string[],
    tableOptions: any,
};

/* Affiche une liste de factures. */
const BeneficiaryViewBillingInvoices = defineComponent({
    name: 'BeneficiaryViewBillingInvoices',
    props: {
        invoices: {
            type: Array as PropType<Props['invoices']>,
            required: true,
        },
    },
    data(): Data {
        const { $t: __ } = this;

        return {
            columns: ['date', 'number', 'amount', 'discount', 'actions'],
            tableOptions: {
                filterable: false,
                columnsDropdown: false,
                preserveState: false,
                filterByColumn: false,
                orderBy: { column: 'date', ascending: false },
                sortable: ['date', 'number', 'amount'],
                headings: {
                    date: __('date'),
                    number: __('number'),
                    amount: __('total-amount'),
                    discount: __('discount'),
                    actions: null,
                },
                columnsClasses: {
                    date: 'BeneficiaryViewBillingInvoices__col BeneficiaryViewBillingInvoices__col--date ',
                    number: 'BeneficiaryViewBillingInvoices__col BeneficiaryViewBillingInvoices__col--number ',
                    amount: 'BeneficiaryViewBillingInvoices__col BeneficiaryViewBillingInvoices__col--amount ',
                    discount: 'BeneficiaryViewBillingInvoices__col BeneficiaryViewBillingInvoices__col--discount ',
                    actions: 'BeneficiaryViewBillingInvoices__col BeneficiaryViewBillingInvoices__col--actions ',
                },
                templates: {
                    date: (h: CreateElement, { date }: Invoice) => moment(date).format('LL'),
                    amount: (h: CreateElement, { total_without_taxes: amount, currency }: Invoice) => (
                        formatAmount(amount, currency)
                    ),
                    discount: (h: CreateElement, { discount_rate: discount }: Invoice) => (
                        discount.isZero() ? __('without-discount') : `${discount.toString()} %`
                    ),
                    actions: (h: CreateElement, { url }: Invoice) => (
                        <Button
                            icon="download"
                            to={url}
                            external
                            download
                        />
                    ),
                },
            },
        };
    },
    computed: {
        isEmpty(): boolean {
            return this.invoices.length === 0;
        },

        total(): Decimal {
            const { invoices } = this;
            return invoices.reduce(
                (total: Decimal, invoice: Invoice): Decimal => (
                    total.add(invoice.total_without_taxes)
                ),
                new Decimal(0),
            );
        },
    },
    render() {
        const { $t: __, isEmpty, invoices, columns, tableOptions, total } = this;

        return (
            <div class="BeneficiaryViewBillingInvoices">
                <div class="BeneficiaryViewBillingInvoices__header">
                    <h3 class="BeneficiaryViewBillingInvoices__title">
                        {__('page.beneficiary-view.billing.invoices-title')}
                    </h3>
                    {!isEmpty && (
                        <Fragment>
                            <div class="BeneficiaryViewBillingInvoices__count">
                                {__('page.beneficiary-view.billing.invoices-count', { count: invoices.length }, invoices.length)}
                            </div>
                            <div class="BeneficiaryViewBillingInvoices__total">
                                {__('page.beneficiary-view.billing.invoices-total-excl-tax', { amount: formatAmount(total) })}
                            </div>
                        </Fragment>
                    )}
                </div>
                {isEmpty && (
                    <EmptyMessage message={__('page.beneficiary-view.billing.no-invoices')} size="small" />
                )}
                {!isEmpty && (
                    <v-client-table
                        name="beneficiaryInvoicesTable"
                        data={invoices}
                        columns={columns}
                        options={tableOptions}
                    />
                )}
            </div>
        );
    },
});

export default BeneficiaryViewBillingInvoices;
