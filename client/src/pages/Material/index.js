import Config from '@/config/globalConfig';
import formatOptions from '@/utils/formatOptions';
import Help from '@/components/Help/Help.vue';
import FormField from '@/components/FormField';
import ImageWithUpload from '@/components/ImageWithUpload/ImageWithUpload.vue';
import Progressbar from '@/components/Progressbar/Progressbar.vue';

export default {
  name: 'Material',
  components: {
    Help,
    FormField,
    ImageWithUpload,
    Progressbar,
  },
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
        park_id: this.$route.query.parkId || '',
        category_id: '',
        rental_price: showBilling ? '' : 0,
        stock_quantity: '1',
        description: '',
        sub_category_id: '',
        replacement_price: '',
        out_of_order_quantity: '0',
        picture: null,
        note: '',
        is_hidden_on_bill: false,
        is_discountable: true,
        attributes: [],
      },
      materialAttributes: {},
      initialPicture: null,
      newPicture: null,
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
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
      const { parks, categories } = this.$store.state;
      return (parks.isFetched && categories.isFetched) ? 'ready' : 'fetching';
    },

    parksOptions() {
      return this.$store.getters['parks/options'];
    },

    firstPark() {
      return this.$store.getters['parks/firstPark'];
    },

    categoriesOptions() {
      return this.$store.getters['categories/options'];
    },

    isAdmin() {
      return this.$store.getters['auth/is']('admin');
    },

    pictureUrl() {
      const { baseUrl } = Config;
      const { id, picture } = this.material;
      return picture ? `${baseUrl}/materials/${id}/picture` : null;
    },
  },
  mounted() {
    this.$store.dispatch('parks/fetch');
    this.$store.dispatch('categories/fetch');

    this.fetchMaterial();
    this.setDefaultPark();
  },
  watch: {
    firstPark() {
      this.setDefaultPark();
    },
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

    setDefaultPark() {
      if (this.material.id === null && this.parksOptions.length === 1) {
        this.material.park_id = this.firstPark?.id || '';
      }
    },

    fetchAttributes() {
      this.extraAttributes = [];

      const { category_id: categoryId } = this.material;
      if (!categoryId) {
        return;
      }

      this.$http.get(`attributes?category=${categoryId}`)
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
        case 'date':
          return 'date';
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

    async saveMaterial(e) {
      e.preventDefault();
      this.resetHelpLoading();

      const { id } = this.material;

      const request = id ? this.$http.put : this.$http.post;
      const route = id ? `materials/${id}` : 'materials';

      const attributes = Object.keys(this.materialAttributes).map((attributeId) => (
        { id: attributeId, value: this.materialAttributes[attributeId] }
      ));

      const postData = { ...this.material, attributes };

      try {
        const response = await request(route, postData);
        const { data } = response;
        this.setMaterialData(data);

        await this.uploadNewPicture();

        this.isLoading = false;
        this.help = { type: 'success', text: 'page-materials.saved' };

        setTimeout(() => {
          this.$router.push(`/materials/${data.id}/view`);
        }, 300);
      } catch (error) {
        this.displayError(error);
      }
    },

    async uploadNewPicture() {
      if (!this.newPicture) {
        return;
      }

      const { id } = this.material;
      if (!id) {
        throw new Error('Cannot upload picture to anonymous material. Please save it before.');
      }

      this.isUploading = true;
      this.uploadError = null;

      const formData = new FormData();
      formData.append('picture-0', this.newPicture);

      const onUploadProgress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const { loaded, total } = event;
        this.uploadProgress = (loaded / total) * 100;
      };

      try {
        await this.$http.post(`materials/${id}/picture`, formData, { onUploadProgress });
      } catch (error) {
        this.uploadError = error;
        throw new Error('Upload failed.');
      } finally {
        this.isUploading = false;
      }
    },

    handleChangePicture(newPicture) {
      this.material.picture = newPicture?.name || null;
      this.newPicture = newPicture;
    },

    handleResetPicture() {
      this.material.picture = this.initialPicture;
      this.newPicture = null;
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
      this.initialPicture = data.picture;
      this.$store.commit('setPageSubTitle', this.material.name);
      this.updateSubCategories();
      this.setMaterialAttributes();
    },

    updateRentalPrice() {
      if (this.material.rental_price > 0) {
        this.material.is_hidden_on_bill = false;
      }
    },

    handleCategoryChange() {
      this.fetchAttributes();
      this.updateSubCategories();
    },

    updateSubCategories() {
      const categories = this.$store.state.categories.list;
      const category = categories.find(
        (_category) => parseInt(_category.id, 10) === parseInt(this.material.category_id, 10),
      );
      if (!category) {
        return;
      }

      this.subCategoriesOptions = formatOptions(category.sub_categories, null, this.$t('please-choose'));

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
