import router from '@/router';
import Alert from '@/components/Alert';
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
      currentlyDeleting: null,
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

    async deleteAttribute(id) {
      this.currentlyDeleting = id;

      const { value: firstConfirm } = await Alert.ConfirmDelete(this.$t, 'attributes', false);
      if (!firstConfirm) {
        this.currentlyDeleting = null;
        return;
      }

      const { value: secondConfirm } = await Alert.ConfirmDelete(
        this.$t,
        'attributes.second-confirm',
        false,
      );
      if (!secondConfirm) {
        this.currentlyDeleting = null;
        return;
      }

      this.error = null;
      this.isLoading = true;

      try {
        await this.$http.delete(`attributes/${id}`);
        this.fetchAttributes();
      } catch (error) {
        this.displayError(error);
      } finally {
        this.currentlyDeleting = null;
      }
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
