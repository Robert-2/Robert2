import store from '@/store';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getMaterialItemsCount from '@/utils/getMaterialItemsCount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import decimalRound from '@/utils/decimalRound';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'EventTotals',
  components: { FormField },
  props: {
    materials: Array,
    withRentalPrices: Boolean,
    discountRate: Number,
    start: Object,
    end: Object,
  },
  data() {
    return {
      duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
      currency: Config.currency.symbol,
    };
  },
  created() {
    store.dispatch('categories/fetch');
  },
  computed: {
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

    formatAmount(amount) {
      return formatAmount(amount);
    },
  },
};
