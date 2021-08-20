import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import BillingForm from '@/components/BillingForm';
import { round, floor } from '@/utils/decimalRound';

// @vue/component
export default {
    name: 'EventEstimates',
    components: { BillingForm },
    props: {
        event: { type: Object, required: true },
        loading: { type: Boolean, default: false },
        deletingId: { type: Number, default: null },
    },
    data: () => ({
        unsavedDiscountRate: null,
        displayCreateEstimate: false,
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

        userCanEdit() {
            return this.$store.getters['auth/is'](['admin', 'member']);
        },

        userCanCreateEstimate() {
            // TODO: Pourquoi le `this.loading` est pertinent pour savoir si l'utilisateur peut créer un devis ?
            if (this.displayCreateEstimate || this.loading) {
                return true;
            }
            return !this.hasEstimate && this.isBillable && this.userCanEdit && this.deletingId == null;
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

        handleCreateEstimate() {
            this.displayCreateEstimate = false;
            if (this.loading) {
                return;
            }

            this.$emit('createEstimate', this.discountRate);
            this.unsavedDiscountRate = null;
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

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
            this.unsavedDiscountRate = null;
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
