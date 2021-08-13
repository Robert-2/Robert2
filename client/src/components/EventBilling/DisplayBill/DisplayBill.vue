<template>
    <div class="DisplayBill">
        <div class="DisplayBill__main">
            <div class="DisplayBill__icon">
                <i class="fas fa-file-invoice-dollar" />
            </div>
            <div class="DisplayBill__text">
                {{ $t('bill-number-generated-at', { number: data.number, date: billDate.format('L') }) }}
                <br />
                {{ $t('with-amount-of', { amount: formatAmount(data.due_amount) }) }}
                <span v-if="data.discount_rate === 0"> ({{ $t('without-discount') }}).</span>
                <span v-else> ({{ $t('discount-rate', { rate: data.discount_rate }) }}).</span>
            </div>
        </div>
        <div class="DisplayBill__actions">
            <a :href="pdfUrl" class="DisplayBill__download">
                <i class="fas fa-download" />
                {{ $t('download-pdf') }}
            </a>
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../../themes/default/index';
    @import './DisplayBill';
</style>

<script>
import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';

export default {
    name: 'DisplayBill',
    props: {
        data: Object,
    },
    computed: {
        pdfUrl() {
            const { baseUrl } = Config;
            const { id } = this.data || { id: null };
            return `${baseUrl}/bills/${id}/pdf`;
        },

        billDate() {
            const { date } = this.data;
            return moment.isMoment(date) ? date : moment(date);
        },
    },
    methods: {
        formatAmount(amount) {
            return formatAmount(amount);
        },
    },
};
</script>
