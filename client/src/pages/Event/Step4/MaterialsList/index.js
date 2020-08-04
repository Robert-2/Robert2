import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import Quantity from './Quantity/Quantity.vue';
import MaterialsStore from './MaterialsStore';

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

    return {
      error: null,
      renderId: 1,
      showSelectedOnly: this.initialList.length > 0,
      isLoading: true,
      columns,
      options: {
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'reference', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: ['reference', 'name'],
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
        requestFunction: (pagination) => {
          this.isLoading = true;
          const filters = this.getFilters();
          const params = { whileEvent: this.eventId, ...pagination, ...filters };
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
    MaterialsStore.commit('init', this.initialList);
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
        params.onlySelectedInEvent = this.eventId;
      }

      return params;
    },

    handleToggleSelectedOnly(newValue) {
      this.showSelectedOnly = newValue;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    refreshTable() {
      this.$refs.DataTable.getData();
    },

    refreshTableAndPagination() {
      this.error = false;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
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

      const materials = Object.keys(MaterialsStore.state.quantities).map(
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
