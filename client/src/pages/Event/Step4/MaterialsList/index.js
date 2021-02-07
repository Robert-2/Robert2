import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import Quantity from './Quantity/Quantity.vue';
import Units from './Units/Units.vue';
import MaterialsStore from './MaterialsStore';

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

    return {
      error: null,
      renderId: 1,
      showSelectedOnly: this.event.materials.length > 0,
      isLoading: true,
      columns,
      options: {
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'reference', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: ['reference', 'name'],
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
        requestFunction: (pagination) => {
          this.isLoading = true;
          const filters = this.getFilters();
          const params = { whileEvent: this.event.id, ...pagination, ...filters };
          return this.$http
            .get('materials', { params })
            .then((response) => {
              this.isLoading = false;
              return response;
            })
            .catch(this.showError);
        },
      },
    };
  },
  created() {
    MaterialsStore.commit('init', this.event.materials);
  },
  methods: {
    getFilters() {
      const params = {};
      if (this.$route.query.park) {
        params.park = this.$route.query.park;
      }

      if (this.$route.query.category) {
        params.category = this.$route.query.category;
      }

      if (this.$route.query.subCategory) {
        params.subCategory = this.$route.query.subCategory;
      }

      if (this.$route.query.tags) {
        params.tags = JSON.parse(this.$route.query.tags);
      }

      if (this.showSelectedOnly) {
        params.onlySelectedInEvent = this.event.id;
      }

      return params;
    },

    handleToggleSelectedOnly(newValue) {
      this.showSelectedOnly = newValue;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    toggleChild(id) {
      this.$refs.DataTable.toggleChildRow(id);
    },

    isChildOpen(id) {
      const tableRef = this.$refs.DataTable.$refs.table;
      return tableRef.openChildRows.includes(id);
    },

    refreshTable() {
      this.$refs.DataTable.getData();
    },

    refreshTableAndPagination() {
      this.error = false;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    getQuantity(material) {
      return MaterialsStore.getters.getQuantity(material.id);
    },

    getRemainingQuantity(material) {
      if (!material.is_unitary) {
        return material.remaining_quantity - this.getQuantity(material);
      }

      const selectedUnits = MaterialsStore.getters.getUnits(material.id);
      if (!selectedUnits.length) {
        return material.remaining_quantity;
      }

      const availableUnits = material.units.filter((unit) => {
        if (!unit.is_available || unit.is_broken) {
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
