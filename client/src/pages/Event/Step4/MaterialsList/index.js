import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import isValidInteger from '@/utils/isValidInteger';
import Quantity from './Quantity/Quantity.vue';
import Units from './Units/Units.vue';
import MaterialsStore from './MaterialsStore';

const noPaginationLimit = 100000;

export default {
  name: 'MaterialsList',
  components: {
    MaterialsFilter,
    SwitchToggle,
    Quantity,
    Units,
  },
  props: {
    event: Object,
  },
  data() {
    const columns = [
      'child-toggler',
      'qty',
      'reference',
      'name',
      'remaining_quantity',
      'price',
      'quantity',
      'amount',
      'actions',
    ].filter((column) => {
      if (Config.billingMode === 'none' || !this.event.is_billable) {
        return !['price', 'amount'].includes(column);
      }
      return true;
    });

    const hasMaterial = this.event.materials.length > 0;

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
        showChildRowToggler: false,
        columnsClasses: {
          'child-toggler': 'MaterialsList__child-toggler',
          qty: 'MaterialsList__qty',
          reference: 'MaterialsList__ref',
          name: 'MaterialsList__name',
          remaining_quantity: 'MaterialsList__remaining',
          price: 'MaterialsList__price',
          quantity: 'MaterialsList__quantity',
          amount: 'MaterialsList__amount',
          actions: 'MaterialsList__actions',
        },
        initFilters: this.getFilters(),
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
              !isOnlySelected || this.getQuantity(row) > 0
            ),
          },
        ],
      },
    };
  },
  created() {
    MaterialsStore.commit('init', this.event.materials);
  },
  mounted() {
    this.fetchMaterials();
  },
  methods: {
    async fetchMaterials() {
      try {
        this.isLoading = true;
        this.$refs.DataTable.setLoadingState(true);
        const { data } = await this.$http.get(`materials/while-event/${this.event.id}`);
        this.materials = data;
      } catch (error) {
        this.showError(error);
      } finally {
        this.isLoading = false;
        this.$refs.DataTable.setLoadingState(false);
      }
    },

    getFilters() {
      const filters = {
        onlySelected: this.showSelectedOnly,
      };

      if (this.$route.query.park && isValidInteger(this.$route.query.park)) {
        filters.park = parseInt(this.$route.query.park, 10);
      }

      if (this.$route.query.category) {
        filters.category = this.$route.query.category;
      }

      if (this.$route.query.subCategory) {
        filters.subCategory = this.$route.query.subCategory;
      }

      if (this.$route.query.tags) {
        filters.tags = JSON.parse(this.$route.query.tags);
      }

      return filters;
    },

    handleToggleSelectedOnly(newValue) {
      this.$refs.DataTable.setCustomFilters({ onlySelected: newValue });
      this.$refs.DataTable.setLimit(
        newValue ? noPaginationLimit : Config.defaultPaginationLimit,
      );
      this.showSelectedOnly = newValue;
    },

    toggleChild(id) {
      this.$refs.DataTable.toggleChildRow(id);
    },

    isChildOpen(id) {
      const tableRef = this.$refs.DataTable.$refs.table;
      return tableRef.openChildRows.includes(id);
    },

    setFilters(filters) {
      const onlySelected = this.showSelectedOnly;
      const newFilters = { ...filters, onlySelected };
      this.$refs.DataTable.setCustomFilters(newFilters);
    },

    getQuantity(material) {
      return MaterialsStore.getters.getQuantity(material.id);
    },

    getRemainingQuantity(material) {
      if (!material.is_unitary) {
        return material.remaining_quantity - this.getQuantity(material);
      }

      const filters = this.getFilters();
      const selectedUnits = MaterialsStore.getters.getUnits(material.id);
      const availableUnits = material.units.filter((unit) => {
        if (!unit.is_available || unit.is_broken) {
          return false;
        }

        if (filters.park && unit.park_id !== filters.park) {
          return false;
        }

        return !selectedUnits.includes(unit.id);
      });

      return availableUnits.length;
    },

    setQuantity(material, value) {
      const quantity = parseInt(value, 10) || 0;
      MaterialsStore.commit('setQuantity', { material, quantity });
      this.handleChanges();
    },

    decrement(material) {
      MaterialsStore.commit('decrement', material);
      this.handleChanges();
    },

    increment(material) {
      MaterialsStore.commit('increment', material);
      this.handleChanges();
    },

    handleChanges() {
      // - This hack is necessary because Vue-table-2 does not re-render the cells
      // - when quantities are changing.
      this.renderId += 1;

      const materialIds = Object.keys(MaterialsStore.state.materials);

      this.hasMaterial = materialIds.length > 0;
      if (!this.hasMaterial) {
        this.handleToggleSelectedOnly(false);
      }

      const materials = Object.entries(MaterialsStore.state.materials).map(
        ([id, { quantity, units }]) => ({ id: parseInt(id, 10), quantity, units: [...units] }),
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
