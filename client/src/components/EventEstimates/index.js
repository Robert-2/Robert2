import moment from 'moment';
import Config from '@/config/globalConfig';
import decimalRound from '@/utils/decimalRound';
import formatAmount from '@/utils/formatAmount';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import BillEstimateCreationForm from '@/components/BillEstimateCreationForm/BillEstimateCreationForm.vue';

// @vue/component
export default {
    name: 'EventEstimates',
    components: { BillEstimateCreationForm },
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
