import Config from '@/config/globalConfig';
import store from '@/store';
import formatAmount from '@/utils/formatAmount';
import getMaterialItemsCount from '@/utils/getMaterialItemsCount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import decimalRound from '@/utils/decimalRound';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'EventBilling',
  components: { FormField },
  props: {
    lastBill: Object,
    beneficiaries: Array,
    materials: Array,
    loading: Boolean,
    start: Object,
    end: Object,
  },
  data() {
    return {
      duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
      discountRate: this.lastBill ? this.lastBill.discount_rate : 0,
      currency: Config.currency.symbol,
      isBillable: this.beneficiaries.length > 0,
      displayCreateBill: false,
    };
  },
  watch: {
    discountRate(newRate) {
      this.$emit('discountRateChange', parseFloat(newRate));
    },
  },
  computed: {
    userCanEdit() {
      const { groupId } = store.state.user;
      return ['admin', 'member'].includes(groupId);
    },

    billPdfUrl() {
      const { baseUrl } = Config;
      const { id } = this.lastBill || { id: null };
      return `${baseUrl}/bills/${id}/pdf`;
    },

    ratio() {
      return Config.degressiveRate(this.duration);
    },

    itemsCount() {
      return getMaterialItemsCount(this.materials);
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

    grandTotalWithDiscount() {
      return this.grandTotal - this.discountAmount;
    },

    replacementTotal() {
      return getEventReplacementTotal(this.materials);
    },
  },
  methods: {
    recalcDiscountRate(newVal) {
      this.discountTarget = parseFloat(newVal);
    },

    createBill(e) {
      e.preventDefault();
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
    },

    formatAmount(amount) {
      return formatAmount(amount);
    },
  },
};
