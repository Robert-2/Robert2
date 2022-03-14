import './index.scss';
import moment from 'moment';
import { Fragment } from 'vue-fragment';
import Config from '@/globals/config';
import { DATE_QUERY_FORMAT } from '@/globals/constants';
import queryClient from '@/globals/queryClient';
import { confirm } from '@/utils/alert';
import Help from '@/components/Help';
import Dropdown, { getItemClassnames } from '@/components/Dropdown';
import isValidInteger from '@/utils/isValidInteger';
import formatAmount from '@/utils/formatAmount';
import isSameDate from '@/utils/isSameDate';
import apiMaterials from '@/stores/api/materials';
import AssignTags from '@/components/AssignTags';
import MaterialsFilters from '@/components/MaterialsFilters';
import MaterialTags from '@/components/MaterialTags';
import Datepicker from '@/components/Datepicker';

const defaultSortableColumns = [
    'reference',
    'name',
    'description',
    'rental_price',
    'replacement_price',
    'stock_quantity',
    'out_of_order_quantity',
];

// @vue/component
export default {
    name: 'Materials',
    data() {
        const { $t: __ } = this;
        const { billingMode } = Config;

        // - Columns
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
        if (billingMode === 'none') {
            columns = columns.filter((column) => column !== 'rental_price');
        }

        return {
            help: 'page-materials.help',
            error: null,
            isLoading: false,
            isDisplayTrashed: false,
            isTrashDisplayed: false,
            periodForQuantities: null,
            columns,
            options: {
                columnsDropdown: true,
                preserveState: true,
                orderBy: { column: 'name', ascending: true },
                initialPage: this.$route.query.page || 1,
                sortable: defaultSortableColumns,
                columnsDisplay: {
                    // - This is a hack: init the table with hidden columns by default
                    park: 'mobile',
                    description: 'mobile',
                    replacement_price: 'mobile',
                    out_of_order_quantity: 'mobile',
                },
                headings: {
                    reference: __('ref'),
                    name: __('name'),
                    description: __('description'),
                    park: __('park'),
                    category: __('category'),
                    rental_price: __('rent-price'),
                    replacement_price: __('repl-price'),
                    stock_quantity: __('quantity'),
                    out_of_order_quantity: __('quantity-out-of-order'),
                    tags: __('tags'),
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
                    actions: 'Materials__actions',
                },
                requestFunction: this.fetch.bind(this),
                templates: {
                    park: (h, material) => this.getParkName(material.park_id),
                    category: (h, material) => (
                        <Fragment>
                            <i class="fas fa-folder-open" />&nbsp;
                            {this.getCategoryName(material.category_id)}
                            {!!material.sub_category_id && (
                                <div>
                                    <i class="fas fa-arrow-right" />&nbsp;
                                    {this.getSubCategoryName(material.sub_category_id)}
                                </div>
                            )}
                        </Fragment>
                    ),
                    rental_price: (h, material) => (
                        formatAmount(material.rental_price)
                    ),
                    replacement_price: (h, material) => (
                        formatAmount(material.replacement_price)
                    ),
                    stock_quantity: (h, material) => (
                        this.getQuantity(material)
                    ),
                    out_of_order_quantity: (h, material) => (
                        material.out_of_order_quantity || ''
                    ),
                    tags: (h, material) => {
                        const { isTrashDisplayed, setTags } = this;
                        const showLabel = material.tags.length === 0 && !isTrashDisplayed;

                        return (
                            <div
                                class="Materials__tags-list"
                                role="button"
                                onClick={() => { setTags(material); }}
                            >
                                <MaterialTags tags={material.tags} />
                                {showLabel && (
                                    <span class="Materials__add-tags">
                                        {__('add-tags')}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    actions: (h, material) => {
                        const {
                            isTrashDisplayed,
                            deleteMaterial,
                            restoreMaterial,
                        } = this;

                        if (isTrashDisplayed) {
                            return (
                                <Fragment>
                                    <button
                                        type="button"
                                        vTooltip={__('action-restore')}
                                        class="item-actions__button info"
                                        onClick={() => { restoreMaterial(material.id); }}
                                    >
                                        <i class="fas fa-trash-restore" />
                                    </button>
                                    <button
                                        type="button"
                                        vTooltip={__('action-delete')}
                                        class="item-actions__button danger"
                                        onClick={() => { deleteMaterial(material.id); }}
                                    >
                                        <i class="fas fa-trash-alt" />
                                    </button>
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment>
                                <router-link to={`/materials/${material.id}/view`} custom>
                                    {({ navigate }) => (
                                        <button
                                            type="button"
                                            vTooltip={__('action-view')}
                                            class="item-actions__button success"
                                            onClick={navigate}
                                        >
                                            <i class="fas fa-eye" />
                                        </button>
                                    )}
                                </router-link>
                                <router-link to={`/materials/${material.id}`} custom>
                                    {({ navigate }) => (
                                        <button
                                            type="button"
                                            vTooltip={__('action-edit')}
                                            class="item-actions__button info"
                                            onClick={navigate}
                                        >
                                            <i class="fas fa-edit" />
                                        </button>
                                    )}
                                </router-link>
                                <button
                                    type="button"
                                    vTooltip={__('action-trash')}
                                    class="item-actions__button warning"
                                    onClick={() => { deleteMaterial(material.id); }}
                                >
                                    <i class="fas fa-trash" />
                                </button>
                            </Fragment>
                        );
                    },
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

        isSingleDayPeriodForQuantities() {
            if (!this.periodForQuantities) {
                return false;
            }
            return isSameDate(this.periodForQuantities[0], this.periodForQuantities[1]);
        },
    },
    watch: {
        periodForQuantities() {
            if (this.periodForQuantities) {
                this.options.sortable = defaultSortableColumns.filter(
                    (sortColumn) => sortColumn !== 'stock_quantity',
                );
            } else {
                this.options.sortable = defaultSortableColumns;
            }

            this.refreshTable();
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('tags/fetch');
    },
    methods: {
        async fetch(pagination) {
            this.isLoading = true;
            this.error = null;

            const filters = this.getFilters();

            try {
                const data = await apiMaterials.all({
                    paginated: true,
                    ...pagination,
                    ...filters,
                    deleted: this.isDisplayTrashed,
                });
                return { data };
            } catch (err) {
                this.error = err;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

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

            if (this.periodForQuantities) {
                const [start, end] = this.periodForQuantities || [null, null];
                const startDate = start ? moment(start).format(DATE_QUERY_FORMAT) : null;
                if (this.isSingleDayPeriodForQuantities) {
                    params.dateForQuantities = startDate;
                } else {
                    const endDate = end ? moment(end).format(DATE_QUERY_FORMAT) : null;
                    params['dateForQuantities[start]'] = startDate;
                    params['dateForQuantities[end]'] = endDate;
                }
            }

            return params;
        },

        async deleteMaterial(materialId) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const { value: isConfirmed } = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page-materials.confirm-delete')
                    : __('page-materials.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.delete(`materials/${materialId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        async restoreMaterial(materialId) {
            const { $t: __ } = this;

            const { value: isConfirmed } = await confirm({
                type: 'restore',
                text: __('page-materials.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.isLoading = true;

            try {
                await this.$http.put(`materials/restore/${materialId}`);
                this.refreshTable();
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
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
            queryClient.invalidateQueries('materials-while-event');

            this.error = null;
            this.isLoading = true;
            this.$refs.DataTable.getData();

            const { headings, columnsClasses } = this.$refs.DataTable.options;

            if (this.periodForQuantities === null) {
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
            this.isTrashDisplayed = !this.isTrashDisplayed;
            this.refreshTableAndPagination();
        },

        formatAmount(value) {
            return value !== null ? formatAmount(value) : '';
        },

        getQuantity(material) {
            if (this.periodForQuantities === null) {
                return material.stock_quantity;
            }
            return material.remaining_quantity;
        },

        removeDateForQuantities() {
            this.periodForQuantities = null;
            this.refreshTable();
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            isAdmin,
            isLoading,
            columns,
            options,
            dropdownItemClass,
            downloadListingUrl,
            showTrashed,
            isTrashDisplayed,
            periodForQuantities,
            removeDateForQuantities,
            refreshTableAndPagination,
            isSingleDayPeriodForQuantities,
        } = this;

        return (
            <div class="content Materials">
                <div class="content__header header-page">
                    <div class="header-page__help">
                        <Help message={help} error={error} isLoading={isLoading} />
                    </div>
                    <div class="header-page__actions">
                        <router-link to="/materials/new" custom>
                            {({ navigate }) => (
                                <button
                                    type="button"
                                    onClick={navigate}
                                    class="Materials__create success"
                                >
                                    <i class="fas fa-plus" />{' '}
                                    {__('page-materials.action-add')}
                                </button>
                            )}
                        </router-link>
                        {isAdmin && (
                            <Dropdown
                                variant="actions"
                                scopedSlots={{
                                    items: () => (
                                        <Fragment>
                                            <router-link to="/attributes" custom>
                                                {({ navigate }) => (
                                                    <li class={dropdownItemClass} onClick={navigate}>
                                                        <i class="fas fa-cog" />{' '}
                                                        {__('page-materials.manage-attributes')}
                                                    </li>
                                                )}
                                            </router-link>
                                            <a
                                                class={dropdownItemClass}
                                                href={downloadListingUrl}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                <i class="fas fa-print" />{' '}
                                                {__('page-materials.print-complete-list')}
                                            </a>
                                        </Fragment>
                                    ),
                                }}
                            />
                        )}
                    </div>
                </div>
                <div class="content__main-view Materials__main-view">
                    <div class="Materials__filters">
                        <MaterialsFilters baseRoute="/materials" onChange={refreshTableAndPagination} />
                        <div class="Materials__quantities-date">
                            <Datepicker
                                vModel={this.periodForQuantities}
                                class="Materials__quantities-date__input"
                                placeholder={__('page-materials.display-quantities-at-date')}
                                isRange
                            />
                            {!!periodForQuantities && (
                                <button
                                    type="button"
                                    class="Materials__quantities-date__clear-button warning"
                                    onClick={removeDateForQuantities}
                                >
                                    <i class="fas fa-backspace Materials__quantities-date__clear-button__icon" />{' '}
                                    {isSingleDayPeriodForQuantities ? __('reset-date') : __('reset-period')}
                                </button>
                            )}
                        </div>
                    </div>
                    <v-server-table
                        ref="DataTable"
                        name="materialsTable"
                        columns={columns}
                        options={options}
                    />
                </div>
                <div class="content__footer">
                    <button
                        type="button"
                        onClick={showTrashed}
                        class={[
                            'Materials__show-trashed',
                            isTrashDisplayed ? 'info' : 'warning',
                        ]}
                    >
                        <i class={['fas', isTrashDisplayed ? 'fa-eye' : 'fa-trash']} />{' '}
                        {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                    </button>
                </div>
            </div>
        );
    },
};
