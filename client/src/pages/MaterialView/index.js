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
    const showBilling = Config.billingMode !== 'none';

    return {
      help: 'page-materials.help-view',
      error: null,
      isLoading: false,
      extraAttributes: [],
      showBilling,
      material: {
        id: this.$route.params.id,
        name: '',
        reference: '',
        park_id: 1,
        category_id: '',
        rental_price: 0,
        stock_quantity: 0,
        description: null,
        sub_category_id: null,
        replacement_price: null,
        out_of_order_quantity: 0,
        note: '',
        is_hidden_on_bill: false,
        is_discountable: true,
        attributes: [],
        created_at: null,
        updated_at: null,
      },
      materialAttributes: {},
      currency: Config.currency.symbol,
      subCategoriesOptions: [
        { value: '', label: this.$t('please-choose') },
      ],
    };
  },
  computed: {
    createDate() {
      const { created_at: createdAd } = this.material;
      return createdAd ? moment(createdAd).format('L') : null;
    },
    updateDate() {
      const { updated_at: updatedAd } = this.material;
      return updatedAd ? moment(updatedAd).format('L') : null;
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
      return formatAmount(this.material.rental_price);
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

    getAttributeType(attributeType) {
      switch (attributeType) {
        case 'integer':
        case 'float':
          return 'number';
        case 'boolean':
          return 'switch';
        default:
          return 'text';
      }
    },

    handleAttributeChange(changed) {
      const { field, newValue } = changed;
      const attribute = this.extraAttributes.find((attr) => attr.name === field);
      if (!attribute) {
        return;
      }

      this.materialAttributes = {
        ...this.materialAttributes,
        [attribute.id]: newValue,
      };
    },

    resetHelpLoading() {
      this.help = 'page-materials.help-view';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      console.log(error);
      this.help = 'page-materials.help-view';
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
      this.setMaterialAttributes();
    },

    updateRentalPrice() {
      if (this.material.rental_price > 0) {
        this.material.is_hidden_on_bill = false;
      }
    },

    setMaterialAttributes() {
      this.materialAttributes = {};
      this.material.attributes.forEach((attribute) => {
        this.materialAttributes[attribute.id] = attribute.value;
      });
    },
  },
};
