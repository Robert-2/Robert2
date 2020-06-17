import Config from '@/config/globalConfig';
import store from '@/store';
import formatOptions from '@/utils/formatOptions';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'Material',
  components: { Help, FormField },
  data() {
    const showBilling = Config.billingMode !== 'none';

    return {
      help: 'page-materials.help-edit',
      error: null,
      isLoading: false,
      extraAttributes: [],
      showBilling,
      material: {
        id: this.$route.params.id || null,
        name: '',
        reference: '',
        park_id: 1,
        category_id: '',
        rental_price: showBilling ? '' : 0,
        stock_quantity: '',
        description: '',
        sub_category_id: '',
        replacement_price: '',
        out_of_order_quantity: '',
        note: '',
        is_hidden_on_bill: false,
        is_discountable: true,
        attributes: [],
      },
      materialAttributes: {},
      errors: {
        name: null,
        reference: null,
        park_id: null,
        category_id: null,
        rental_price: null,
        stock_quantity: null,
      },
      currency: Config.currency.symbol,
      subCategoriesOptions: [
        { value: '', label: this.$t('please-choose') },
      ],
    };
  },
  computed: {
    entitiesState() {
      const { parks, categories } = store.state;
      return (parks.isFetched && categories.isFetched) ? 'ready' : 'fetching';
    },
    parksOptions() {
      return store.getters['parks/options'];
    },
    categoriesOptions() {
      return store.getters['categories/options'];
    },
  },
  mounted() {
    store.dispatch('parks/fetch');
    store.dispatch('categories/fetch');

    this.fetchMaterial();
  },
  methods: {
    fetchMaterial() {
      const { id } = this.material;
      if (!id || id === 'new') {
        this.fetchAttributes();
        return;
      }

      this.resetHelpLoading();

      const { resource } = this.$route.meta;
      this.$http.get(`${resource}/${id}`)
        .then(({ data }) => {
          this.setMaterialData(data);
          this.fetchAttributes();
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    fetchAttributes() {
      this.$http.get('materials/attributes')
        .then(({ data }) => {
          this.extraAttributes = data;
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

    saveMaterial(e) {
      e.preventDefault();
      this.resetHelpLoading();

      const { id } = this.material;
      const { resource } = this.$route.meta;

      let request = this.$http.post;
      let route = resource;
      if (id) {
        request = this.$http.put;
        route = `${resource}/${id}`;
      }

      const attributes = Object.keys(this.materialAttributes).map((attributeId) => (
        { id: attributeId, value: this.materialAttributes[attributeId] }
      ));

      const postData = {
        ...this.material,
        attributes,
      };

      request(route, postData)
        .then(({ data }) => {
          this.isLoading = false;
          this.help = { type: 'success', text: 'page-materials.saved' };
          this.setMaterialData(data);

          setTimeout(() => {
            this.$router.push('/materials');
          }, 300);
        })
        .catch(this.displayError);
    },

    resetHelpLoading() {
      this.help = 'page-materials.help-edit';
      this.error = null;
      this.isLoading = true;
    },

    displayError(error) {
      this.help = 'page-materials.help-edit';
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
      this.updateSubCategories();
      this.setMaterialAttributes();
    },

    updateRentalPrice() {
      if (this.material.rental_price > 0) {
        this.material.is_hidden_on_bill = false;
      }
    },

    updateSubCategories() {
      const categories = store.state.categories.list;
      const category = categories.find(
        (_category) => parseInt(_category.id, 10) === parseInt(this.material.category_id, 10),
      );
      if (!category) {
        return;
      }

      this.subCategoriesOptions = formatOptions(
        category.sub_categories,
        ['name'],
        this.$t('please-choose'),
      );

      this.refreshSubCategorySelect();
    },

    setMaterialAttributes() {
      this.materialAttributes = {};
      this.material.attributes.forEach((attribute) => {
        this.materialAttributes[attribute.id] = attribute.value;
      });
    },

    refreshSubCategorySelect() {
      const subCategoryId = parseInt(this.material.sub_category_id, 10) || '';
      if (!subCategoryId) {
        return;
      }

      const isInCategory = this.subCategoriesOptions.find(
        (_subCategory) => _subCategory.value === subCategoryId,
      );
      if (!isInCategory) {
        return;
      }

      this.material.sub_category_id = '';
      setTimeout(() => {
        this.material.sub_category_id = subCategoryId;
      }, 0);
    },
  },
};
