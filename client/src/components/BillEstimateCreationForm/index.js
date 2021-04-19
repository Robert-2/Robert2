import Config from '@/config/globalConfig';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'BillEstimateCreationForm',
  components: { FormField },
  props: {
    discountRate: Number,
    discountTarget: Number,
    maxAmount: Number,
    beneficiary: Object,
    saveLabel: String,
    isRegeneration: Boolean,
    loading: Boolean,
  },
  data() {
    return {
      currency: Config.currency.symbol,
    };
  },
  methods: {
    handleChangeRate(value) {
      this.$emit('change', { field: 'rate', value: Number.parseFloat(value) });
    },

    handleChangeAmount(value) {
      this.$emit('change', { field: 'amount', value: Number.parseFloat(value) });
    },

    handleSubmit(e) {
      e.preventDefault();
      this.$emit('submit');
    },
  },
};
