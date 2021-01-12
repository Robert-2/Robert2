import VueSelect from 'vue-select';
import store from '@/store';

export default {
  name: 'MaterialsFilters',
  components: { VueSelect },
  props: {
    baseRoute: String,
  },
  data() {
    return {
      filters: {
        park: this.$route.query.park || '',
        category: this.$route.query.category || '',
        subCategory: this.$route.query.subCategory || '',
        tags: [],
      },
      selectedCategory: { sub_categories: [] },
    };
  },
  computed: {
    parks() {
      return store.state.parks.list;
    },

    categories() {
      return store.state.categories.list;
    },

    isFilterEmpty() {
      return (
        this.filters.park === ''
        && this.filters.category === ''
        && this.filters.subCategory === ''
        && this.filters.tags.length === 0
      );
    },
  },
  mounted() {
    store.dispatch('parks/fetch');
    store.dispatch('categories/fetch');
    store.dispatch('tags/fetch');
  },
  watch: {
    categories() {
      const { category, subCategory } = this.filters;
      if (subCategory.length > 0 && this.categories.length > 0) {
        this.selectedCategory = this.categories.find(
          (_category) => _category.id === parseInt(category, 10),
        ) || { sub_categories: [] };
      }
    },
  },
  methods: {
    changePark(e) {
      this.filters.park = parseInt(e.currentTarget.value, 10) || '';
      this.setQueryFilters();
    },

    changeCategory(e) {
      const categoryId = parseInt(e.currentTarget.value, 10) || '';
      if (categoryId) {
        this.selectedCategory = this.categories.find(
          (category) => category.id === categoryId,
        );
      } else {
        this.selectedCategory = { sub_categories: [] };
      }
      this.filters.category = categoryId;
      this.filters.subCategory = '';
      this.setQueryFilters();
    },

    changeSubCategory(e) {
      this.filters.subCategory = parseInt(e.currentTarget.value, 10) || '';
      this.setQueryFilters();
    },

    clearFilters() {
      this.selectedCategory = { sub_categories: [] };
      this.filters = {
        park: '',
        category: '',
        subCategory: '',
        tags: [],
      };
      this.setQueryFilters();
    },

    setQueryFilters() {
      const query = {};
      const {
        park,
        category,
        subCategory,
        tags,
      } = this.filters;

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

      this.$router.push({ path: this.baseRoute, query });
      this.$emit('change');
    },
  },
};
