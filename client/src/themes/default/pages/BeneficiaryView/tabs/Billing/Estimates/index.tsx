import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import formatAmount from '@/utils/formatAmount';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { CreateElement } from 'vue';
import type { Estimate } from '@/stores/api/estimates';

type Props = {
    /* Liste de devis. */
    estimates: Estimate[],
};

type Data = {
    columns: string[],
    tableOptions: any,
};

/* Affiche une liste de devis. */
const BeneficiaryViewBillingEstimates = defineComponent({
    name: 'BeneficiaryViewBillingEstimates',
    props: {
        estimates: {
            type: Array as PropType<Props['estimates']>,
            required: true,
        },
    },
    data(): Data {
        const { $t: __ } = this;

        return {
            columns: ['date', 'amount', 'discount', 'actions'],
            tableOptions: {
                filterable: false,
                columnsDropdown: false,
                preserveState: false,
                filterByColumn: false,
                orderBy: { column: 'date', ascending: false },
                sortable: ['date', 'amount'],
                headings: {
                    date: __('date'),
                    amount: __('total-amount'),
                    discount: __('discount'),
                    actions: null,
                },
                columnsClasses: {
                    date: 'BeneficiaryViewBillingEstimates__col BeneficiaryViewBillingEstimates__col--date ',
                    amount: 'BeneficiaryViewBillingEstimates__col BeneficiaryViewBillingEstimates__col--amount ',
                    discount: 'BeneficiaryViewBillingEstimates__col BeneficiaryViewBillingEstimates__col--discount ',
                    actions: 'BeneficiaryViewBillingEstimates__col BeneficiaryViewBillingEstimates__col--actions ',
                },
                templates: {
                    date: (h: CreateElement, { date }: Estimate) => moment(date).format('LL HH:mm'),
                    amount: (h: CreateElement, { total_without_taxes: amount, currency }: Estimate) => (
                        formatAmount(amount, currency)
                    ),
                    discount: (h: CreateElement, { discount_rate: discount }: Estimate) => (
                        discount.isZero() ? __('without-discount') : `${discount.toString()} %`
                    ),
                    actions: (h: CreateElement, { url }: Estimate) => (
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
            return this.estimates.length === 0;
        },
    },
    render() {
        const { $t: __, isEmpty, estimates, columns, tableOptions } = this;

        return (
            <div class="BeneficiaryViewBillingEstimates">
                <div class="BeneficiaryViewBillingEstimates__header">
                    <h3 class="BeneficiaryViewBillingEstimates__title">
                        {__('page.beneficiary-view.billing.estimates-title')}
                    </h3>
                    {!isEmpty && (
                        <div class="BeneficiaryViewBillingEstimates__count">
                            {__('page.beneficiary-view.billing.estimates-count', { count: estimates.length }, estimates.length)}
                        </div>
                    )}
                </div>
                {isEmpty && (
                    <EmptyMessage message={__('page.beneficiary-view.billing.no-estimates')} size="small" />
                )}
                {!isEmpty && (
                    <v-client-table
                        name="beneficiaryEstimatesTable"
                        data={estimates}
                        columns={columns}
                        options={tableOptions}
                    />
                )}
            </div>
        );
    },
});

export default BeneficiaryViewBillingEstimates;
