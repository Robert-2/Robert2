import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import Quantity from './Quantity/Quantity.vue';
import MaterialsStore from './MaterialsStore';

const noPaginationLimit = 100000;

export default {
  name: 'MaterialsList',
  components: { MaterialsFilter, SwitchToggle, Quantity },
  props: {
    eventId: Number,
    initialList: Array,
    eventIsBillable: Boolean,
  },
  data() {
    const columns = [
      'qty',
      'reference',
      'name',
      'remaining_quantity',
      'price',
      'quantity',
      'amount',
      'actions',
    ].filter((column) => {
      if (Config.billingMode === 'none' || !this.eventIsBillable) {
        return !['price', 'amount'].includes(column);
      }
      return true;
    });

    const hasMaterial = this.initialList.length > 0;

    const initFilters = {
      onlySelected: hasMaterial,
    };

    if (this.$route.query.park) {
      initFilters.park = this.$route.query.park;
    }

    if (this.$route.query.category) {
      initFilters.category = this.$route.query.category;
    }

    if (this.$route.query.subCategory) {
      initFilters.subCategory = this.$route.query.subCategory;
    }

    if (this.$route.query.tags) {
      initFilters.tags = JSON.parse(this.$route.query.tags);
    }

    return {
      error: null,
      renderId: 1,
      hasMaterial,
      showSelectedOnly: hasMaterial,
      isLoading: true,
      columns,
      materials: [],
      tableOptions: {
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'reference', ascending: true },
        initialPage: 1,
        perPage: hasMaterial ? noPaginationLimit : Config.defaultPaginationLimit,
        columnsClasses: {
          qty: 'MaterialsList__qty',
          reference: 'MaterialsList__ref',
          name: 'MaterialsList__name',
          remaining_quantity: 'MaterialsList__remaining',
          price: 'MaterialsList__price',
          quantity: 'MaterialsList__quantity',
          amount: 'MaterialsList__amount',
          actions: 'MaterialsList__actions',
        },
        initFilters,
        customFilters: [
          {
            name: 'park',
            callback: (row, parkId) => row.park_id === parkId,
          },
          {
            name: 'category',
            callback: (row, categoryId) => row.category_id === categoryId,
          },
          {
            name: 'subCategory',
            callback: (row, subCategoryId) => row.sub_category_id === subCategoryId,
          },
          {
            name: 'tags',
            callback: (row, tags) => (
              tags.length === 0 || row.tags.some((tag) => tags.includes(tag.name))
            ),
          },
          {
            name: 'onlySelected',
            callback: (row, isOnlySelected) => (
              !isOnlySelected || this.getQuantity(row.id) > 0
            ),
          },
        ],
      },
    };
  },
  created() {
    MaterialsStore.commit('init', this.initialList);
  },
  mounted() {
    this.fetchMaterials();
  },
  methods: {
    async fetchMaterials() {
      try {
        this.isLoading = true;
        this.$refs.DataTable.setLoadingState(true);
        const { data } = await this.$http.get(`materials/while-event/${this.eventId}`);
        this.materials = data;
      } catch (error) {
        this.showError(error);
      } finally {
        this.isLoading = false;
        this.$refs.DataTable.setLoadingState(false);
      }
    },

    handleToggleSelectedOnly(newValue) {
      this.$refs.DataTable.setCustomFilters({ onlySelected: newValue });
      this.$refs.DataTable.setLimit(
        newValue ? noPaginationLimit : Config.defaultPaginationLimit,
      );
      this.showSelectedOnly = newValue;
    },

    setFilters(filters) {
      const onlySelected = this.showSelectedOnly;
      const newFilters = { ...filters, onlySelected };
      this.$refs.DataTable.setCustomFilters(newFilters);
    },

    getQuantity(materialId) {
      return MaterialsStore.getters.getQuantity(materialId);
    },

    getRemainingQuantity(material) {
      return material.remaining_quantity - MaterialsStore.getters.getQuantity(material.id);
    },

    setQuantity(id, value) {
      const quantity = parseInt(value, 10) || 0;
      MaterialsStore.commit('setQuantity', { id, quantity });
      this.handleQuantitiesChange();
    },

    decrement(id) {
      MaterialsStore.commit('decrement', id);
      this.handleQuantitiesChange();
    },

    increment(id) {
      MaterialsStore.commit('increment', id);
      this.handleQuantitiesChange();
    },

    handleQuantitiesChange() {
      // - This hack is necessary because Vue-table-2 does not re-render the cells
      // - when quantities are changing.
      this.renderId += 1;

      const materialIds = Object.keys(MaterialsStore.state.quantities);

      this.hasMaterial = materialIds.length > 0;
      if (!this.hasMaterial) {
        this.handleToggleSelectedOnly(false);
      }

      const materials = materialIds.map(
        (id) => ({ id: parseInt(id, 10), quantity: MaterialsStore.getters.getQuantity(id) }),
      );
      this.$emit('change', materials);
    },

    formatAmount(amount) {
      return formatAmount(amount);
    },

    showError(error) {
      this.isLoading = false;
      this.error = error.message;
    },
  },
};
