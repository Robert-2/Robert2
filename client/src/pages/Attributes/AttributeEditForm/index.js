export default {
    name: 'AttributeEditForm',
    props: { errors: Object },
    data() {
        return {
            hasUnit: true,
            hasMaxLength: false,
            categories: [],
        };
    },
    computed: {
        categoriesOptions() {
            return this.$store.getters['categories/options']
                .filter(({ value }) => value !== '');
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        handleTypeChange(e) {
            const { value } = e.currentTarget;
            this.hasUnit = value === 'integer' || value === 'float';
            this.hasMaxLength = value === 'string';
        },

        toggleCategory(categoryId) {
            const foundIndex = this.categories.findIndex((id) => id === categoryId);
            if (foundIndex === -1) {
                this.categories.push(categoryId);
                return;
            }

            this.categories.splice(foundIndex, 1);
        },

        isSelected(categoryId) {
            return this.categories.includes(categoryId);
        },

        getValues() {
            const { InputName, InputType, InputUnit, InputMaxLength } = this.$refs;

            const name = InputName.value;
            const type = InputType.value;
            const unit = InputUnit ? (InputUnit.value || null) : null;
            const maxLength = InputMaxLength ? (InputMaxLength.value || null) : null;

            let categories = [];
            if (this.categories.length < this.categoriesOptions.length) {
                categories = this.categories;
            }

            return {
                name,
                type,
                unit,
                max_length: maxLength,
                categories,
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
