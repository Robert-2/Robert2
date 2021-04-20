import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getMaterialItemsCount from '@/utils/getMaterialItemsCount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import decimalRound from '@/utils/decimalRound';
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

    return {
      duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
      discountRate: lastEstimate ? lastEstimate.discount_rate : 0,
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
