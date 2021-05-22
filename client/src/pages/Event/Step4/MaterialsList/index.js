import MaterialsFilter from '@/components/MaterialsFilters/MaterialsFilters.vue';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import observeBarcodeScan from '@/utils/observeBarcodeScan';
import MaterialsStore from './MaterialsStore';
import Quantity from './Quantity/Quantity.vue';
import Units from './Units/Units.vue';
import { normalizeFilters } from './_utils';

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
      manualOrder: [],
      tableOptions: {
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'custom', ascending: true },
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
            callback: (row, parkId) => {
              if (!row.is_unitary) {
                return row.park_id === parkId;
              }
              return row.units.some((unit) => unit.park_id === parkId);
            },
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

    this.cancelScanObservation = observeBarcodeScan(this.handleScan);
  },
  beforeDestroy() {
    if (this.cancelScanObservation) {
      this.cancelScanObservation();
    }
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

    handleScan(id, unitId) {
      if (!id || !unitId) {
        return;
      }

      const material = this.materials.find((_material) => _material.id === id);
      if (!material) {
        return;
      }

      const unit = material.units.find((_unit) => _unit.id === unitId);
      if (!unit || !unit.is_available) {
        return;
      }

      // - On affiche uniquement les items selectionnés.
      this.setSelectedOnly(true);

      // - On reset les filtres (au cas ou l'item scanné n'est pas dedans).
      if (this.isFiltered) {
        this.$refs.filters.clearFilters();
      }

      // - Si elle n'est pas encore sélectionnée, on sélectionne l'unité.
      const selectedUnits = MaterialsStore.getters.getUnits(material.id);
      const isAlreadySelected = selectedUnits.includes(unit.id);
      if (!isAlreadySelected) {
        MaterialsStore.commit('selectUnit', { material, unitId: unit.id });
        this.handleChanges();
      }

      // - Ajoute l'élément au tableau des ordonnés "manuellement".
      const existingOrderIndex = this.manualOrder.indexOf(material.id);
      if (existingOrderIndex !== -1) {
        this.manualOrder.splice(existingOrderIndex, 1);
      }
      this.manualOrder.push(material.id);

      // TODO: Améliorer ça, pas idéal d'avoir à référencer le `.content` ici ...
      document.querySelector('.content').scrollTo(0, 0);
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

    toggleChild(id) {
      this.$refs.DataTable.toggleChildRow(id);
    },

    isChildOpen(id) {
      const tableRef = this.$refs.DataTable.$refs.table;
      return tableRef.openChildRows.includes(id);
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

    handleFiltersChanges(filters) {
      const onlySelected = this.showSelectedOnly;
      const newFilters = normalizeFilters({ ...filters, onlySelected });
      this.$refs.DataTable.setCustomFilters(newFilters);
    },

    handleChanges() {
      // - This hack is necessary because Vue-table-2 does not re-render the cells
      // - when quantities are changing.
      this.renderId += 1;

      const materialIds = Object.keys(MaterialsStore.state.materials);

      this.hasMaterial = materialIds.length > 0;
      if (!this.hasMaterial) {
        this.setSelectedOnly(false);
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
