import moment from 'moment';
import decimalRound from '@/utils/decimalRound';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
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
        event: { type: Object, required: true },
        loading: { type: Boolean, default: false },
    },
    data: () => ({
        unsavedDiscountRate: null,
        displayCreateBill: false,
    }),
    computed: {
        isBillable() {
            if (!this.event.beneficiaries) {
                return false;
            }
            return this.event.beneficiaries.length > 0;
        },

        hasBill() {
            if (!this.event.bills) {
                return false;
            }
            return this.event.bills.length > 0;
        },

        hasEstimate() {
            if (!this.event.estimates) {
                return false;
            }
            return this.event.estimates.length > 0;
        },

        lastBill() {
            const [lastBill] = this.event.bills ?? [];
            return { ...lastBill, date: moment(lastBill.date) };
        },

        userCanEdit() {
            return this.$store.getters['auth/is'](['admin', 'member']);
        },

        userCanCreateBill() {
            // TODO: Pourquoi le `this.loading` est pertinent pour savoir si l'utilisateur peut créer une facture ?
            if (this.displayCreateBill || this.loading) {
                return true;
            }
            return !this.hasBill && this.isBillable && this.userCanEdit;
        },

        duration() {
            const start = moment(this.event.start_date);
            const end = moment(this.event.end_date);
            return start && end ? end.diff(start, 'days') + 1 : 1;
        },

        total() {
            return getEventOneDayTotal(this.event.materials);
        },

        grandTotal() {
            return getEventGrandTotal(this.total, this.duration);
        },

        totalDiscountable() {
            return getEventOneDayTotalDiscountable(this.event.materials);
        },

        grandTotalDiscountable() {
            return getEventGrandTotal(this.totalDiscountable, this.duration);
        },

        discountRate() {
            if (this.unsavedDiscountRate !== null) {
                return this.unsavedDiscountRate;
            }
            return getEventDiscountRate(this.event);
        },

        discountTarget: {
            get() {
                const discountAmount = this.grandTotalDiscountable * (this.discountRate / 100);
                return decimalRound(this.grandTotal - discountAmount);
            },
            set(value) {
                const diff = this.grandTotal - value;
                const rate = 100 * (diff / this.grandTotalDiscountable);
                this.unsavedDiscountRate = decimalRound(rate, 4);
            },
        },
    },
    watch: {
        unsavedDiscountRate(newRate) {
            this.$emit('discountRateChange', Number.parseFloat(newRate));
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeDiscount({ field, value }) {
            if (field === 'amount') {
                this.discountTarget = value;
            } else if (field === 'rate') {
                this.unsavedDiscountRate = value;
            }
        },

        handleCreateBill() {
            this.displayCreateBill = false;
            if (this.loading) {
                return;
            }

            this.$emit('createBill', this.discountRate);
            this.unsavedDiscountRate = null;
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        openBillRegeneration() {
            this.displayCreateBill = true;
        },

        closeBillRegeneration() {
            this.displayCreateBill = false;
            this.unsavedDiscountRate = null;
        },
    },
};
