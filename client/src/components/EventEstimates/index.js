import moment from 'moment';
import Config from '@/config/globalConfig';
import decimalRound from '@/utils/decimalRound';
import formatAmount from '@/utils/formatAmount';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import BillEstimateCreationForm from '@/components/BillEstimateCreationForm/BillEstimateCreationForm.vue';

export default {
    name: 'EventEstimates',
    components: { BillEstimateCreationForm },
    props: {
        beneficiaries: Array,
        materials: Array,
        estimates: Array,
        lastBill: Object,
        loading: Boolean,
        deletingId: Number,
        start: Object,
        end: Object,
    },
    data() {
        const [lastEstimate] = this.estimates;
        const discountRate = getDiscountRateFromLast(this.lastBill, lastEstimate);

        return {
            discountRate,
            duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
            currency: Config.currency.symbol,
            isBillable: this.beneficiaries.length > 0,
            displayCreateEstimate: false,
        };
    },
    watch: {
        discountRate(newRate) {
            this.$emit('discountRateChange', Number.parseFloat(newRate));
        },
    },
    computed: {
        userCanEdit() {
            return this.$store.getters['auth/is'](['admin', 'member']);
        },

        total() {
            return getEventOneDayTotal(this.materials);
        },

        grandTotal() {
            return getEventGrandTotal(this.total, this.duration);
        },

        totalDiscountable() {
            return getEventOneDayTotalDiscountable(this.materials);
        },

        grandTotalDiscountable() {
            return getEventGrandTotal(this.totalDiscountable, this.duration);
        },

        discountAmount() {
            return this.grandTotalDiscountable * (this.discountRate / 100);
        },

        discountTarget: {
            get() {
                return decimalRound(this.grandTotal - this.discountAmount);
            },
            set(value) {
                const diff = this.grandTotal - value;
                const rate = 100 * (diff / this.grandTotalDiscountable);
                this.discountRate = decimalRound(rate, 4);
            },
        },
    },
    methods: {
        handleChangeDiscount({ field, value }) {
            if (field === 'amount') {
                this.discountTarget = value;
            } else if (field === 'rate') {
                this.discountRate = value;
            }
        },

        createEstimate() {
            this.displayCreateEstimate = false;
            if (this.loading) {
                return;
            }

            this.$emit('createEstimate', this.discountRate);
        },

        getPdfUrl(id) {
            if (this.deletingId === id) {
                return '#';
            }

            const { baseUrl } = Config;
            return `${baseUrl}/estimates/${id}/pdf`;
        },

        openCreateEstimate() {
            this.displayCreateEstimate = true;
        },

        closeCreateEstimate() {
            this.displayCreateEstimate = false;

            const [lastEstimate] = this.estimates;
            this.discountRate = getDiscountRateFromLast(
                this.lastBill,
                lastEstimate,
                this.discountRate,
            );
        },

        formatDate(date) {
            const momentDate = moment(date);
            return {
                date: momentDate.format('L'),
                hour: momentDate.format('HH:mm'),
            };
        },

        formatAmount(amount) {
            return formatAmount(amount);
        },
    },
};
