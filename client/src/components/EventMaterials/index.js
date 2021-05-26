import store from '@/store';
import formatAmount from '@/utils/formatAmount';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';

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
      return dispatchMaterialInSections(
        this.materials,
        'category_id',
        categoryNameGetter,
        'price',
      );
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
