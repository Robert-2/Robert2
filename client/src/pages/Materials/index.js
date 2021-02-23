import Config from '@/config/globalConfig';
import ModalConfig from '@/config/modalConfig';
import store from '@/store';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import isValidInteger from '@/utils/isValidInteger';
import AssignTags from '@/components/AssignTags/AssignTags.vue';
import MaterialsFilters from '@/components/MaterialsFilters/MaterialsFilters.vue';
import MaterialTags from '@/components/MaterialTags/MaterialTags.vue';
import formatAmount from '@/utils/formatAmount';

export default {
  name: 'Materials',
  components: { Help, MaterialsFilters, MaterialTags },
  data() {
    const columns = [
      'reference',
      'name',
      'description',
      'park',
      'category',
      'rental_price',
      'replacement_price',
      'stock_quantity',
      'out_of_order_quantity',
      'tags',
      'actions',
    ];

    if (Config.billingMode === 'none') {
      columns.splice(5, 1); // - Removes 'rental_price'
    }

    return {
      help: 'page-materials.help',
      error: null,
      isLoading: false,
      isDisplayTrashed: false,
      isTrashDisplayed: false,
      columns,
      options: {
        columnsDropdown: true,
        preserveState: true,
        orderBy: { column: 'name', ascending: true },
        initialPage: this.$route.query.page || 1,
        sortable: [
          'reference',
          'name',
          'description',
          'rental_price',
          'replacement_price',
          'stock_quantity',
          'out_of_order_quantity',
        ],
        columnsDisplay: {
          // - This is a hack: init the table with hidden columns by default
          park: 'mobile',
          description: 'mobile',
          replacement_price: 'mobile',
          out_of_order_quantity: 'mobile',
        },
        headings: {
          reference: this.$t('ref'),
          name: this.$t('name'),
          description: this.$t('description'),
          park: this.$t('park'),
          category: this.$t('category'),
          rental_price: this.$t('rent-price'),
          replacement_price: this.$t('repl-price'),
          stock_quantity: this.$t('quantity'),
          out_of_order_quantity: this.$t('quantity-out-of-order'),
          tags: this.$t('tags'),
          actions: '',
        },
        columnsClasses: {
          reference: 'Materials__ref',
          name: 'Materials__name',
          park: 'Materials__park',
          category: 'Materials__category',
          description: 'Materials__description',
          rental_price: 'Materials__rental-price',
          replacement_price: 'Materials__replacement-price',
          stock_quantity: 'Materials__quantity',
          out_of_order_quantity: 'Materials__quantity-out',
          tags: 'Materials__tags',
        },
        requestFunction: (pagination) => {
          this.isLoading = true;
          const filters = this.getFilters();
          const params = {
            ...pagination,
            ...filters,
            deleted: this.isDisplayTrashed ? '1' : '0',
          };
          return this.$http
            .get(this.$route.meta.resource, { params })
            .catch(this.showError)
            .finally(() => {
              this.isTrashDisplayed = this.isDisplayTrashed;
              this.isLoading = false;
            });
        },
      },
    };
  },
  mounted() {
    store.dispatch('categories/fetch');
    store.dispatch('tags/fetch');
  },
  methods: {
    getParkName(parkId) {
      return store.getters['parks/parkName'](parkId) || '--';
    },

    getCategoryName(categoryId) {
      return store.getters['categories/categoryName'](categoryId);
    },

    getSubCategoryName(subCategoryId) {
      return store.getters['categories/subCategoryName'](subCategoryId);
    },

    getFilters() {
      const params = {};

      if (this.$route.query.park && isValidInteger(this.$route.query.park)) {
        params.park = parseInt(this.$route.query.park, 10);
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

      return params;
    },

    deleteMaterial(materialId) {
      const isSoft = !this.isTrashDisplayed;
      Alert.ConfirmDelete(this.$t, 'materials', isSoft)
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.delete(`${this.$route.meta.resource}/${materialId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    restoreMaterial(materialId) {
      Alert.ConfirmRestore(this.$t, 'materials')
        .then((result) => {
          if (!result.value) {
            return;
          }

          this.error = null;
          this.isLoading = true;
          this.$http.put(`${this.$route.meta.resource}/restore/${materialId}`)
            .then(this.refreshTable)
            .catch(this.showError);
        });
    },

    setTags({ id, name, tags }) {
      if (this.isTrashDisplayed) {
        return;
      }

      const modalConfig = {
        ...ModalConfig,
        width: 600,
        draggable: true,
        clickToClose: false,
      };

      this.$modal.show(
        AssignTags,
        {
          entity: 'materials',
          id,
          name,
          initialTags: tags,
        },
        modalConfig,
        {
          'before-close': () => {
            this.refreshTable();
          },
        },
      );
    },

    refreshTable() {
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.getData();
    },

    refreshTableAndPagination() {
      this.error = null;
      this.isLoading = true;
      this.$refs.DataTable.refresh();
    },

    showTrashed() {
      this.isDisplayTrashed = !this.isDisplayTrashed;
      this.refreshTableAndPagination();
    },

    showError(error) {
      this.isLoading = false;
      this.error = error;
    },

    formatAmount(value) {
      return formatAmount(value);
    },

    getStockQuantity(material) {
      if (!material.is_unitary) {
        return material.stock_quantity;
      }

      const filters = this.getFilters();
      if (!filters.park) {
        return material.units.length;
      }

      const parkUnits = material.units.filter(
        (unit) => unit.park_id === filters.park,
      );
      return parkUnits.length;
    },
  },
};
