import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Invoice } from '@/stores/api/invoices';

export enum InvoiceLayout {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal',
}

type Props = {
    /** La facture à afficher. */
    invoice: Invoice,

    /**
     * Le layout à utiliser pour l'affichage.
     *
     * @see {@link InvoiceLayout}
     */
    layout?: InvoiceLayout,

    /**
     * La facture est-elle obsolète ?
     *
     * Par exemple si elle une nouvelle facture pour la même
     * "cible" a été régénérée depuis.
     */
    outdated?: boolean,
};

// @vue/component
const EventDetailsInvoice = defineComponent({
    name: 'EventDetailsInvoice',
    props: {
        invoice: {
            type: Object as PropType<Required<Props>['invoice']>,
            required: true,
        },
        layout: {
            type: String as PropType<Required<Props>['layout']>,
            default: InvoiceLayout.VERTICAL,
            validator: (value: string) => (
                (Object.values(InvoiceLayout) as string[]).includes(value)
            ),
        },
        outdated: {
            type: Boolean as PropType<Required<Props>['outdated']>,
            default: false,
        },
    },
    computed: {
        normalizedInvoice() {
            const { invoice } = this;
            const date = moment(invoice.date);
            return { ...invoice, date };
        },

        useTaxes() {
            const {
                total_without_taxes: totalWithoutTaxes,
                total_with_taxes: totalWithTaxes,
            } = this.invoice;

            return totalWithoutTaxes.toNumber() !== totalWithTaxes.toNumber();
        },
    },
    render() {
        const { $t: __, layout, outdated, normalizedInvoice, useTaxes } = this;
        const {
            url,
            date,
            number,
            currency,
            discount_rate: discountRate,
            total_without_taxes: totalWithoutTaxes,
        } = normalizedInvoice;
        const isVerticalLayout = layout === InvoiceLayout.VERTICAL;

        // - Discount text
        const discountText = !discountRate.isZero()
            ? __('discount-rate', { rate: discountRate.toString() })
            : __('without-discount');

        const className = [
            'EventDetailsInvoice',
            `EventDetailsInvoice--${layout}`, {
                'EventDetailsInvoice--outdated': outdated,
            },
        ];

        return (
            <div class={className}>
                <div class="EventDetailsInvoice__main">
                    <div class="EventDetailsInvoice__icon">
                        <Icon name="file-invoice-dollar" />
                    </div>
                    <div class="EventDetailsInvoice__text">
                        {__('invoice-title', { number, date: date.format('L') })}<br />
                        {
                            useTaxes
                                ? __('with-amount-of-excl-tax', { amount: formatAmount(totalWithoutTaxes, currency) })
                                : __('with-amount-of', { amount: formatAmount(totalWithoutTaxes, currency) })
                        }
                        {' '}({discountText}).
                    </div>
                </div>
                <div class="EventDetailsInvoice__actions">
                    <Button
                        icon="download"
                        type="secondary"
                        class="EventDetailsInvoice__download"
                        to={url}
                        external
                        download
                    >
                        {isVerticalLayout ? __('download-invoice') : __('download')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default EventDetailsInvoice;
