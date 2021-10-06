import './index.scss';
import { defineComponent } from '@vue/composition-api';
import VueSelect from 'vue-select';

// @vue/component
export default defineComponent({
    name: 'MaterialsFilters',
    components: { VueSelect },
    data() {
        return {
            filters: {
                park: this.$route.query.park || '',
                category: this.$route.query.category || '',
                subCategory: this.$route.query.subCategory || '',
                tags: [],
            },
        };
    },
    computed: {
        parks() {
            return this.$store.state.parks.list;
        },

        categories() {
            return this.$store.state.categories.list;
        },

        subCategories() {
            const selectedCategoryIdRaw = this.filters.category;
            if (selectedCategoryIdRaw === '') {
                return [];
            }

            const selectedCategoryId = parseInt(selectedCategoryIdRaw, 10);
            const selectedCategory = this.categories.find(
                (category) => category.id === selectedCategoryId,
            );

            return selectedCategory?.sub_categories || [];
        },

        isFilterEmpty() {
            return (
                this.filters.park === '' &&
                this.filters.category === '' &&
                this.filters.subCategory === '' &&
                this.filters.tags.length === 0
            );
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('tags/fetch');
    },
    methods: {
        changePark(e) {
            this.filters.park = parseInt(e.currentTarget.value, 10) || '';
            this.setQueryFilters();
        },

        changeCategory(e) {
            this.filters.category = parseInt(e.currentTarget.value, 10) || '';
            this.filters.subCategory = '';
            this.setQueryFilters();
        },

        changeSubCategory(e) {
            this.filters.subCategory = parseInt(e.currentTarget.value, 10) || '';
            this.setQueryFilters();
        },

        clearFilters() {
            this.filters = {
                park: '',
                category: '',
                subCategory: '',
                tags: [],
            };
            this.setQueryFilters();
        },

        setQueryFilters() {
            const { park, category, subCategory, tags } = this.filters;

            const filters = {
                park: park || null,
                category: category || null,
                subCategory: subCategory || null,
                tags: tags.map((tag) => tag.label),
            };

            const query = {};
            if (park) {
                query.park = park;
            }
            if (category) {
                query.category = category;
            }
            if (subCategory) {
                query.subCategory = subCategory;
            }
            if (tags.length > 0) {
                query.tags = JSON.stringify(tags.map((tag) => tag.label));
            }

            this.$router.push({ query });
            this.$emit('change', filters);
        },
    },
});
