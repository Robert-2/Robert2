import './index.scss';
import moment from 'moment';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';

// @vue/component
export default {
    name: 'DisplayBill',
    props: {
        data: { type: Object, required: true },
    },
    computed: {
        pdfUrl() {
            const { id } = this.data || { id: null };
            return `${config.baseUrl}/bills/${id}/pdf`;
        },

        normalizedData() {
            const { data } = this;

            const date = moment.isMoment(data.date)
                ? data.date
                : moment(data.date);

            return { ...data, date };
        },
    },
    render() {
        const { $t: __, pdfUrl, normalizedData } = this;
        const {
            date,
            number,
            discount_rate: discountRate,
            due_amount: dueAmount,
        } = normalizedData;

        // - Discount text
        let discountText = __('without-discount');
        if (discountRate > 0) {
            discountText = __('discount-rate', { rate: discountRate });
        }

        return (
            <div class="DisplayBill">
                <div class="DisplayBill__main">
                    <div class="DisplayBill__icon">
                        <i class="fas fa-file-invoice-dollar" />
                    </div>
                    <div class="DisplayBill__text">
                        {__('bill-number-generated-at', { number, date: date.format('L') })}<br />
                        {__('with-amount-of', { amount: formatAmount(dueAmount) })}
                        {' '}({discountText}).
                    </div>
                </div>
                <div class="DisplayBill__actions">
                    <a href={pdfUrl} class="DisplayBill__download">
                        <i class="fas fa-download" /> {__('download-pdf')}
                    </a>
                </div>
            </div>
        );
    },
};
