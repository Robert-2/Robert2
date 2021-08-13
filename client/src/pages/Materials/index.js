import moment from 'moment';
import Config from '@/config/globalConfig';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import Dropdown, { getItemClassnames } from '@/components/Dropdown';
import isValidInteger from '@/utils/isValidInteger';
import PromptDate from '@/components/PromptDate';
import AssignTags from '@/components/AssignTags/AssignTags.vue';
import MaterialsFilters from '@/components/MaterialsFilters/MaterialsFilters.vue';
import MaterialTags from '@/components/MaterialTags/MaterialTags.vue';
import formatAmount from '@/utils/formatAmount';

export default {
    name: 'Materials',
    components: {
        Help,
        Dropdown,
        MaterialsFilters,
        MaterialTags,
    },
    data() {
        let columns = [
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

        const { billingMode } = Config;

        if (billingMode === 'none') {
            columns = columns.filter((column) => column !== 'rental_price');
        }

        return {
            help: 'page-materials.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            dateForQuantities: null,
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
                    out_of_order_quantity: 'Materials__quantity-broken',
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
                        .get('materials', { params })
                        .catch(this.showError)
                        .finally(() => {
                            this.isTrashDisplayed = this.isDisplayTrashed;
                            this.isLoading = false;
                        });
                },
            },
        };
    },
    computed: {
        isAdmin() {
            return this.$store.getters['auth/is']('admin');
        },

        downloadListingUrl() {
            const { baseUrl } = Config;
            return `${baseUrl}/materials/pdf`;
        },

        dropdownItemClass() {
            return getItemClassnames();
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('tags/fetch');
    },
    methods: {
        getParkName(parkId) {
            return this.$store.getters['parks/parkName'](parkId) || '--';
        },

        getCategoryName(categoryId) {
            return this.$store.getters['categories/categoryName'](categoryId);
        },

        getSubCategoryName(subCategoryId) {
            return this.$store.getters['categories/subCategoryName'](subCategoryId);
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

            if (this.dateForQuantities) {
                params.dateForQuantities = this.dateForQuantities.format('YYYY-MM-DD');
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
                    this.$http.delete(`materials/${materialId}`)
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
                    this.$http.put(`materials/restore/${materialId}`)
                        .then(this.refreshTable)
                        .catch(this.showError);
                });
        },

        setTags({ id, name, tags }) {
            if (this.isTrashDisplayed) {
                return;
            }

            this.$modal.show(
                AssignTags,
                { id, name, entity: 'materials', initialTags: tags },
                { width: 600, draggable: true, clickToClose: false },
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

            const { headings, columnsClasses } = this.$refs.DataTable.options;

            if (this.dateForQuantities === null) {
                headings.stock_quantity = this.$t('quantity');
                columnsClasses.stock_quantity = 'Materials__quantity';
            } else {
                headings.stock_quantity = this.$t('remaining-quantity');
                columnsClasses.stock_quantity = 'Materials__quantity Materials__quantity--remaining';
            }
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
            return value !== null ? formatAmount(value) : '';
        },

        getQuantity(material) {
            if (this.dateForQuantities === null) {
                return material.stock_quantity;
            }
            return material.remaining_quantity;
        },

        async showQuantityAtDateModal() {
            if (this.dateForQuantities) {
                return;
            }

            this.$modal.show(
                PromptDate,
                {
                    title: this.$t('page-materials.display-quantities-at-date'),
                    defaultDate: new Date(),
                },
                { width: 600, draggable: true, clickToClose: false },
                {
                    'before-close': ({ params }) => {
                        if (params) {
                            this.dateForQuantities = moment(params.date);
                            this.refreshTable();
                        }
                    },
                },
            );
        },

        removeDateForQuantities() {
            this.dateForQuantities = null;
            this.refreshTable();
        },
    },
};
