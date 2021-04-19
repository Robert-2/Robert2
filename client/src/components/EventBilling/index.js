import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import decimalRound from '@/utils/decimalRound';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import BillEstimateCreationForm from '@/components/BillEstimateCreationForm/BillEstimateCreationForm.vue';

export default {
  name: 'EventBilling',
  components: { BillEstimateCreationForm },
  props: {
    lastBill: Object,
    lastEstimate: Object,
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
      currency: Config.currency.symbol,
      isBillable: this.beneficiaries.length > 0,
      displayCreateBill: false,
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

    pdfUrl() {
      const { baseUrl } = Config;
      const { id } = this.lastBill || { id: null };
      return `${baseUrl}/bills/${id}/pdf`;
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
        return decimalRound((this.grandTotal - this.discountAmount));
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

    formatAmount(amount) {
      return formatAmount(amount);
    },
  },
};
