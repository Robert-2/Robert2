import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Decimal from 'decimal.js';
import formatAmount from '@/utils/formatAmount';
import { DateTimeReadableFormat } from '@/utils/datetime';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import { ClientTable } from '@/themes/default/components/Table';
import Button from '@/themes/default/components/Button';
import Fragment from '@/components/Fragment';

import type { PropType } from '@vue/composition-api';
import type { CreateElement } from 'vue';
import type { Invoice } from '@/stores/api/invoices';
import type { Columns } from '@/themes/default/components/Table/Client';

type Props = {
    /** Liste de factures. */
    invoices: Invoice[],
};

/** Affiche une liste de factures. */
const BeneficiaryViewBillingInvoices = defineComponent({
    name: 'BeneficiaryViewBillingInvoices',
    props: {
        invoices: {
            type: Array as PropType<Props['invoices']>,
            required: true,
        },
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

        columns(): Columns<Invoice> {
            const { $t: __ } = this;

            return [
                {
                    key: 'date',
                    title: __('date'),
                    class: [
                        'BeneficiaryViewBillingInvoices__col',
                        'BeneficiaryViewBillingInvoices__col--date',
                    ],
                    sortable: (ascending: boolean) => (
                        (a: Invoice, b: Invoice): number => {
                            const result = a.date.compare(b.date);
                            return ascending ? result : -result;
                        }
                    ),
                    render: (h: CreateElement, invoice: Invoice) => (
                        invoice.date.toReadable(DateTimeReadableFormat.LONG)
                    ),
                },
                {
                    key: 'number',
                    title: __('number'),
                    sortable: true,
                    class: [
                        'BeneficiaryViewBillingInvoices__col',
                        'BeneficiaryViewBillingInvoices__col--number',
                    ],
                },
                {
                    key: 'amount',
                    title: __('total-amount'),
                    class: [
                        'BeneficiaryViewBillingInvoices__col',
                        'BeneficiaryViewBillingInvoices__col--amount',
                    ],
                    sortable: (ascending: boolean) => (
                        (a: Invoice, b: Invoice): number => {
                            const result = a.total_without_taxes.cmp(b.total_without_taxes);
                            return ascending ? result : -result;
                        }
                    ),
                    render: (h: CreateElement, invoice: Invoice) => (
                        formatAmount(invoice.total_without_taxes, invoice.currency)
                    ),
                },
                {
                    key: 'discount',
                    title: __('discount'),
                    class: [
                        'BeneficiaryViewBillingInvoices__col',
                        'BeneficiaryViewBillingInvoices__col--discount',
                    ],
                    render: (h: CreateElement, { discount_rate: discount }: Invoice) => (
                        discount.isZero() ? __('without-discount') : `${discount.toString()} %`
                    ),
                },
                {
                    key: 'actions',
                    title: '',
                    class: [
                        'BeneficiaryViewBillingInvoices__col',
                        'BeneficiaryViewBillingInvoices__col--actions',
                    ],
                    render: (h: CreateElement, { url }: Invoice) => (
                        <Button icon="download" to={url} external download />
                    ),
                },
            ];
        },
    },
    render() {
        const { $t: __, isEmpty, invoices, columns, total } = this;

        const renderContent = (): JSX.Element => {
            if (isEmpty) {
                return (
                    <EmptyMessage
                        message={__('page.beneficiary-view.billing.no-invoices')}
                        size="small"
                    />
                );
            }

            return (
                <ClientTable
                    columns={columns}
                    data={invoices}
                    withColumnsSelector={false}
                    defaultOrderBy={{
                        column: 'date',
                        ascending: false,
                    }}
                />
            );
        };

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
                {renderContent()}
            </div>
        );
    },
});

export default BeneficiaryViewBillingInvoices;
