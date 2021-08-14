import decimalRound from '@/utils/decimalRound';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import BillEstimateCreationForm from '@/components/BillEstimateCreationForm/BillEstimateCreationForm.vue';
import DisplayBill from './DisplayBill/DisplayBill.vue';

// @vue/component
export default {
    name: 'EventBilling',
    components: {
        DisplayBill,
        BillEstimateCreationForm,
    },
    props: {
        lastBill: Object,
        lastEstimate: Object,
        allBills: Array,
        beneficiaries: Array,
        materials: Array,
        loading: Boolean,
        start: Object,
        end: Object,
    },
    data() {
        const discountRate = getDiscountRateFromLast(this.lastBill, this.lastEstimate);

        return {
            discountRate,
            duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
            isBillable: this.beneficiaries.length > 0,
            displayCreateBill: false,
        };
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
    watch: {
        discountRate(newRate) {
            this.$emit('discountRateChange', Number.parseFloat(newRate));
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

        createBill() {
            this.displayCreateBill = false;
            if (this.loading) {
                return;
            }

            this.$emit('createBill', this.discountRate);
        },

        openBillRegeneration() {
            this.displayCreateBill = true;
        },

        closeBillRegeneration() {
            this.displayCreateBill = false;
            this.discountRate = getDiscountRateFromLast(
                this.lastBill,
                this.lastEstimate,
                this.discountRate,
            );
        },
    },
};
