import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import store from '@/store';
import Help from '@/components/Help/Help.vue';
import MaterialTags from '@/components/MaterialTags/MaterialTags.vue';

export default {
  name: 'MaterialView',
  components: { Help, MaterialTags },
  data() {
    return {
      help: '',
      error: null,
      isLoading: false,
      extraAttributes: [],
      showBilling: Config.billingMode !== 'none',
      material: {
        id: this.$route.params.id,
        attributes: [],
      },
    };
  },
  computed: {
    createDate() {
      const { created_at: createdAt } = this.material;
      return createdAt ? moment(createdAt).format('L') : null;
    },
    updateDate() {
      const { updated_at: updatedAt } = this.material;
      return updatedAt ? moment(updatedAt).format('L') : null;
    },
    categoryName() {
      const { category_id: categoryId } = this.material;
      const categoryNameGetter = store.getters['categories/categoryName'];
      return categoryNameGetter(categoryId);
    },
    subCategoryName() {
      const { sub_category_id: subCategoryId } = this.material;
      const subCategoryNameGetter = store.getters['categories/subCategoryName'];
      return subCategoryNameGetter(subCategoryId);
    },
    rentalPrice() {
      const { rental_price: rentalPrice } = this.material;
      return rentalPrice ? formatAmount(rentalPrice) : null;
    },
    replacementPrice() {
      const { replacement_price: replacementPrice } = this.material;
      return replacementPrice ? formatAmount(replacementPrice) : null;
    },
    queryStringCategory() {
      return `category=${this.material.category_id}`;
    },
    queryStringSubCategory() {
      return `category=${this.material.category_id}&subCategory=${this.material.sub_category_id}`;
    },
  },
  mounted() {
    store.dispatch('categories/fetch');

    this.fetchMaterial();
  },
  methods: {
    fetchMaterial() {
      const { id } = this.material;

      this.resetHelpLoading();

      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setMaterialData(data);
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      console.log(error);
      this.error = error;
      this.isLoading = false;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    setMaterialData(data) {
      this.material = data;
      store.commit('setPageSubTitle', this.material.name);
    },
  },
};
