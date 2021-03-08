import router from '@/router';
import Help from '@/components/Help/Help.vue';
import AttributeEditForm from './AttributeEditForm/AttributeEditForm.vue';

export default {
  name: 'Attributes',
  components: { Help, AttributeEditForm },
  data() {
    return {
      attributes: [],
      isAddingMode: false,
      errors: {},
      help: 'page-attributes.help',
      error: null,
      isLoading: false,
      editAttribute: null,
      editAttributeName: '',
    };
  },
  mounted() {
    this.fetchAttributes();
  },
  methods: {
    fetchAttributes() {
      this.isLoading = true;
      this.$http.get('attributes')
        .then(({ data }) => {
          this.attributes = data;
          this.isLoading = false;
        })
        .catch(this.displayError);
    },

    toggleAddingMode() {
      this.isAddingMode = !this.isAddingMode;

      if (!this.isAddingMode) {
        this.resetForm();
      }
    },

    handleTypeChange(e) {
      const { value } = e.currentTarget;
      this.hasMaxLength = value === 'string';
      this.hasUnit = value === 'integer' || value === 'float';
    },

    saveAttribute() {
      this.isLoading = true;
      this.error = null;
      this.errors = {};
      const data = this.$refs.AttributeEditForm.getValues();

      this.$http.post('/attributes', data)
        .then(() => {
          this.resetForm();
          this.fetchAttributes();
        })
        .catch(this.displayError);
    },

    startEditAttribute(id, name) {
      this.editAttributeName = name;
      this.editAttribute = id;
    },

    cancelAttributeName() {
      this.editAttributeName = '';
      this.editAttribute = null;
    },

    saveAttributeName(id) {
      this.isLoading = true;
      this.error = null;
      this.errors = {};

      const name = this.editAttributeName;
      this.$http.put(`/attributes/${id}`, { name })
        .then(() => {
          this.fetchAttributes();
          this.editAttribute = null;
          this.editAttributeName = '';
        })
        .catch(this.displayError);
    },

    displayError(error) {
      this.isLoading = false;
      this.error = error;

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    resetForm() {
      this.errors = {};
      this.isLoading = false;
      this.isAddingMode = false;

      this.$refs.AttributeEditForm.reset();
    },

    goBack() {
      router.back();
    },
  },
};
