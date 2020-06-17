import store from '@/store';
import formatAmount from '@/utils/formatAmount';
import dispatchMaterialInCategories from '@/utils/dispatchMaterialInCategories';

export default {
  name: 'EventMaterials',
  props: {
    materials: Array,
    start: Object,
    end: Object,
    withRentalPrices: { type: Boolean, default: true },
    hideDetails: { type: Boolean, default: false },
  },
  data() {
    return { showMaterialsList: !this.hideDetails };
  },
  computed: {
    categories() {
      const categoryNameGetter = store.getters['categories/categoryName'];
      return dispatchMaterialInCategories(this.materials, categoryNameGetter);
    },
  },
  created() {
    store.dispatch('categories/fetch');
  },
  methods: {
    formatAmount(amount) {
      return formatAmount(amount);
    },
  },
};
