import './index.scss';
import moment from 'moment';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import BillingForm from '@/components/BillingForm';
import DisplayBill from './DisplayBill';
import { round, floor } from '@/utils/decimalRound';

// @vue/component
export default {
    name: 'EventBilling',
    components: {
        DisplayBill,
        BillingForm,
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

        grandTotal() {
            const total = getEventOneDayTotal(this.event.materials);
            return getEventGrandTotal(total, this.duration);
        },

        grandTotalDiscountable() {
            const totalDiscountable = getEventOneDayTotalDiscountable(this.event.materials);
            return getEventGrandTotal(totalDiscountable, this.duration);
        },

        maxDiscountRate() {
            if (this.grandTotal <= 0) {
                return 0;
            }

            const rate = (this.grandTotalDiscountable * 100) / this.grandTotal;
            return floor(rate, 4);
        },

        discountRate: {
            get() {
                if (this.unsavedDiscountRate !== null) {
                    return this.unsavedDiscountRate;
                }
                return Math.min(getEventDiscountRate(this.event), this.maxDiscountRate);
            },
            set(value) {
                this.unsavedDiscountRate = Math.min(value, this.maxDiscountRate);
            },
        },

        discountTarget: {
            get() {
                const discountAmount = this.grandTotalDiscountable * (this.discountRate / 100);
                return round(this.grandTotal - discountAmount);
            },
            set(value) {
                if (this.grandTotal <= 0 || this.grandTotalDiscountable === 0) {
                    this.unsavedDiscountRate = 0;
                    return;
                }

                let discountAmount = this.grandTotal - value;
                if (discountAmount > this.grandTotalDiscountable) {
                    discountAmount = this.grandTotalDiscountable;
                }

                const rate = 100 * (discountAmount / this.grandTotalDiscountable);
                this.unsavedDiscountRate = Math.min(round(rate, 4), this.maxDiscountRate);
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
                this.discountRate = value;
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
