export default {
  name: 'AttributeEditForm',
  props: { errors: Object },
  data() {
    return {
      hasUnit: false,
      hasMaxLength: true,
    };
  },
  methods: {
    handleTypeChange(e) {
      const { value } = e.currentTarget;
      this.hasUnit = value === 'integer' || value === 'float';
      this.hasMaxLength = value === 'string';
    },

    getValues() {
      const {
        InputName,
        InputType,
        InputUnit,
        InputMaxLength,
      } = this.$refs;

      const name = InputName.value;
      const type = InputType.value;
      const unit = InputUnit ? (InputUnit.value || null) : null;
      const maxLength = InputMaxLength ? (InputMaxLength.value || null) : null;

      return {
        name,
        type,
        unit,
        max_length: maxLength,
      };
    },

    reset() {
      this.$refs.InputName.value = '';
      this.$refs.InputType.value = '';

      if (this.$refs.InputUnit) {
        this.$refs.InputUnit.value = '';
      }

      if (this.$refs.InputMaxLength) {
        this.$refs.InputMaxLength.value = '';
      }
    },
  },
};
