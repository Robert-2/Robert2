import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialsStore from './MaterialsStore';
import Quantity from './Quantity';
import { normalizeFilters } from './_utils';

const noPaginationLimit = 100000;

export default {
  name: 'MaterialsList',
  components: {
    MaterialsFilter,
    SwitchToggle,
    Quantity,
  },
  props: {
    event: Object,
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
      manualOrder: [],
      tableOptions: {
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'custom', ascending: true },
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
        initFilters: this.getFilters(true, true),
        customSorting: {
          custom: (ascending) => (a, b) => {
            let result = null;

            // - Si on est en mode "sélectionnés uniquement" et qu'au moins l'un
            //   des deux à un ordre manuellement défini, on l'utilise.
            if (this.showSelectedOnly) {
              const aManualOrderIndex = this.manualOrder.indexOf(a.id);
              const bManualOrderIndex = this.manualOrder.indexOf(b.id);
              if (aManualOrderIndex !== -1 || bManualOrderIndex !== -1) {
                result = aManualOrderIndex > bManualOrderIndex ? -1 : 1;
              }
            }

            // - Sinon on fallback sur le tri par reference.
            if (result === null) {
              result = a.reference.localeCompare(b.reference, { ignorePunctuation: true });
            }

            return ascending || result === 0 ? result : -result;
          },
        },
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
  computed: {
    isFiltered() {
      return Object.keys(this.getFilters(false)).length !== 0;
    },
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

    getFilters(extended = true, isInit = false) {
      const filters = {};

      if (extended) {
        filters.onlySelected = isInit
          ? this.event.materials.length
          : this.showSelectedOnly;
      }

      ['park', 'category', 'subCategory'].forEach((key) => {
        if (key in this.$route.query) {
          filters[key] = this.$route.query[key];
        }
      });

      if (this.$route.query.tags) {
        filters.tags = JSON.parse(this.$route.query.tags);
      }

      return normalizeFilters(filters, extended);
    },

    setSelectedOnly(onlySelected) {
      this.$refs.DataTable.setCustomFilters({ ...this.getFilters(), onlySelected });
      this.$refs.DataTable.setLimit(
        onlySelected ? noPaginationLimit : Config.defaultPaginationLimit,
      );
      this.showSelectedOnly = onlySelected;
    },

    getQuantity(material) {
      return MaterialsStore.getters.getQuantity(material.id);
    },

    getRemainingQuantity(material) {
      return material.remaining_quantity - this.getQuantity(material);
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

    handleFiltersChanges(filters) {
      const onlySelected = this.showSelectedOnly;
      const newFilters = normalizeFilters({ ...filters, onlySelected });
      this.$refs.DataTable.setCustomFilters(newFilters);
    },

    handleChanges() {
      const materialIds = Object.keys(MaterialsStore.state.materials);

      this.hasMaterial = materialIds.length > 0;
      if (!this.hasMaterial) {
        this.setSelectedOnly(false);
      }

      const materials = Object.entries(MaterialsStore.state.materials).map(
        ([id, { quantity }]) => ({ id: parseInt(id, 10), quantity }),
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
