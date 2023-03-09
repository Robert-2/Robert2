import './index.scss';
import config from '@/globals/config';
import queryClient from '@/globals/queryClient';
import { confirm } from '@/utils/alert';
import initColumnsDisplay from '@/utils/initColumnsDisplay';
import isValidInteger from '@/utils/isValidInteger';
import formatAmount from '@/utils/formatAmount';
import isSameDate from '@/utils/isSameDate';
import showModal from '@/utils/showModal';
import apiMaterials from '@/stores/api/materials';
import AssignTags from '@/themes/default/modals/AssignTags';
import Fragment from '@/components/Fragment';
import Dropdown, { getItemClassnames } from '@/themes/default/components/Dropdown';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import TagsList from '@/themes/default/components/TagsList';
import Datepicker from '@/themes/default/components/Datepicker';
import { Group } from '@/stores/api/groups';

// @vue/component
export default {
    name: 'Materials',
    data() {
        const { $options } = this;

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
        if (config.billingMode === 'none') {
            columns = columns.filter((column) => column !== 'rental_price');
        }

        return {
            hasCriticalError: false,
            isLoading: false,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,
            periodForQuantities: null,

            //
            // - Tableau
            //

            columns,
            options: {
                columnsDropdown: true,
                preserveState: true,
                saveState: true,
                orderBy: { column: 'name', ascending: true },
                sortable: [],
                columnsDisplay: initColumnsDisplay($options.name, {
                    reference: true,
                    name: true,
                    description: false,
                    park: false,
                    category: true,
                    rental_price: true,
                    replacement_price: false,
                    stock_quantity: true,
                    out_of_order_quantity: false,
                    tags: true,
                }),
                headings: {},
                columnsClasses: {},
                requestFunction: this.fetch.bind(this),
                templates: {
                    reference: (h, { id, reference }) => {
                        if (this.isTrashDisplayed) {
                            return reference;
                        }

                        return (
                            <router-link
                                to={{ name: 'view-material', params: { id } }}
                                class="Materials__link"
                            >
                                {reference}
                            </router-link>
                        );
                    },
                    name: (h, { id, name }) => {
                        if (this.isTrashDisplayed) {
                            return name;
                        }

                        return (
                            <router-link
                                to={{ name: 'view-material', params: { id } }}
                                class="Materials__link"
                            >
                                {name}
                            </router-link>
                        );
                    },
                    park: (h, { park_id: parkId }) => {
                        const parkName = this.$store.getters['parks/parkName'](parkId) || '--';

                        return (
                            <router-link
                                to={{ name: 'parks', params: { id: parkId } }}
                                class="Materials__link"
                            >
                                {parkName}
                            </router-link>
                        );
                    },
                    category: (h, material) => {
                        const { $t: __ } = this;
                        const { category_id: categoryId, sub_category_id: subCategoryId } = material;
                        const categoryName = this.$store.getters['categories/categoryName'](categoryId);
                        if (!categoryName) {
                            return (
                                <span class="Materials__not-categorized">
                                    {__('not-categorized')}
                                </span>
                            );
                        }

                        const subCategoryName = subCategoryId
                            ? this.$store.getters['categories/subCategoryName'](subCategoryId)
                            : null;

                        return (
                            <Fragment>
                                <Icon name="folder-open" />&nbsp;{categoryName}
                                {!!subCategoryName && (
                                    <div>
                                        <Icon name="arrow-right" />&nbsp;{subCategoryName}
                                    </div>
                                )}
                            </Fragment>
                        );
                    },
                    rental_price: (h, material) => (
                        formatAmount(material.rental_price ?? 0)
                    ),
                    replacement_price: (h, material) => (
                        formatAmount(material.replacement_price ?? 0)
                    ),
                    stock_quantity: (h, material) => {
                        if (this.periodForQuantities !== null) {
                            return material.available_quantity;
                        }

                        return material.stock_quantity;
                    },
                    out_of_order_quantity: (h, material) => (
                        material.out_of_order_quantity || ''
                    ),
                    tags: (h, material) => {
                        const { $t: __, isTrashDisplayed, handleSetTags } = this;

                        return (
                            <div
                                class="Materials__tags-list"
                                role="button"
                                onClick={() => { handleSetTags(material); }}
                            >
                                <TagsList tags={material.tags} />
                                {(material.tags.length === 0 && !isTrashDisplayed) && (
                                    <span class="Materials__add-tags">
                                        {__('add-tags')}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    actions: (h, { id }) => {
                        const {
                            isTrashDisplayed,
                            handleRestoreItem,
                            handleDeleteItem,
                        } = this;

                        if (isTrashDisplayed) {
                            return (
                                <div>
                                    <Button
                                        type="restore"
                                        onClick={() => { handleRestoreItem(id); }}
                                    />
                                    <Button
                                        type="delete"
                                        onClick={() => { handleDeleteItem(id); }}
                                    />
                                </div>
                            );
                        }

                        return (
                            <div>
                                <Button
                                    icon="eye"
                                    to={{ name: 'view-material', params: { id } }}
                                />
                                <Button
                                    type="edit"
                                    to={{ name: 'edit-material', params: { id } }}
                                />
                                <Button
                                    type="trash"
                                    onClick={() => { handleDeleteItem(id); }}
                                />
                            </div>
                        );
                    },
                },
            },
        };
    },
    computed: {
        isAdmin() {
            return this.$store.getters['auth/is'](Group.ADMIN);
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

        dataTableOptions() {
            const { $t: __ } = this;
            const headings = {
                reference: __('ref'),
                name: __('name'),
                description: __('description'),
                park: __('park'),
                category: __('category'),
                rental_price: __('rent-price'),
                replacement_price: __('repl-price'),
                stock_quantity: __('stock-qty'),
                out_of_order_quantity: __('out-of-order-qty'),
                tags: __('tags'),
                actions: '',
            };
            let sortable = [
                'reference',
                'name',
                'description',
                'rental_price',
                'replacement_price',
                'stock_quantity',
                'out_of_order_quantity',
            ];
            const columnsClasses = {
                reference: 'Materials__ref ',
                name: 'Materials__name ',
                park: 'Materials__park ',
                category: 'Materials__category ',
                description: 'Materials__description ',
                rental_price: 'Materials__rental-price ',
                replacement_price: 'Materials__replacement-price ',
                stock_quantity: 'Materials__quantity ',
                out_of_order_quantity: 'Materials__quantity-broken ',
                tags: 'Materials__tags ',
                actions: 'Materials__actions ',
            };

            if (this.periodForQuantities) {
                headings.stock_quantity = __('remaining-qty');
                columnsClasses.stock_quantity = 'Materials__quantity Materials__quantity--remaining ';
                sortable = sortable.filter(
                    (sortColumn) => sortColumn !== 'stock_quantity',
                );
            } else {
                headings.stock_quantity = __('stock-qty');
                columnsClasses.stock_quantity = 'Materials__quantity ';
            }

            return { ...this.options, headings, sortable, columnsClasses };
        },
    },
    watch: {
        periodForQuantities() {
            queryClient.invalidateQueries('materials-while-event');
            this.$refs.table.refresh();
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('tags/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeFilters() {
            this.$refs.table.setPage(1);
            this.$refs.table.refresh();
        },

        handleRemoveDateForQuantities() {
            this.periodForQuantities = null;
            queryClient.invalidateQueries('materials-while-event');
            this.$refs.table.refresh();
        },

        async handleDeleteItem(id) {
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: isSoft ? 'warning' : 'danger',

                text: isSoft
                    ? __('page.materials.confirm-delete')
                    : __('page.materials.confirm-permanently-delete'),

                confirmButtonText: isSoft
                    ? __('yes-delete')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiMaterials.remove(id);
                this.$toasted.success(__('page.materials.deleted'));
                queryClient.invalidateQueries('materials-while-event');
                this.$refs.table.refresh();
            } catch (error) {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItem(id) {
            const { $t: __ } = this;

            const isConfirmed = await confirm({
                type: 'restore',
                text: __('page.materials.confirm-restore'),
                confirmButtonText: __('yes-restore'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiMaterials.restore(id);
                this.$toasted.success(__('page.materials.restored'));
                queryClient.invalidateQueries('materials-while-event');
                this.$refs.table.refresh();
            } catch (error) {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleSetTags({ id, name, tags }) {
            if (this.isTrashDisplayed) {
                return;
            }

            showModal(this.$modal, AssignTags, {
                id,
                name,
                entity: 'materials',
                initialTags: tags,
                onClose: () => {
                    this.$refs.table.refresh();
                },
            });
        },

        handleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.isTrashDisplayed = !this.isTrashDisplayed;
            this.$refs.table.setPage(1);
            this.$refs.table.refresh();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination) {
            this.isLoading = true;
            const filters = this.getFilters();

            try {
                const data = await apiMaterials.all({
                    paginated: true,
                    ...pagination,
                    ...filters,
                    deleted: this.shouldDisplayTrashed,
                });
                return { data };
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

        getFilters() {
            const { query } = this.$route;
            const params = {};

            if (query.park && isValidInteger(query.park)) {
                params.park = parseInt(query.park, 10);
            }

            if (query.category) {
                params.category = query.category;
            }

            if (query.subCategory) {
                params.subCategory = query.subCategory;
            }

            if (query.tags) {
                params.tags = JSON.parse(query.tags);
            }

            if (this.periodForQuantities) {
                const [start, end] = this.periodForQuantities || [null, null];

                if (this.isSingleDayPeriodForQuantities) {
                    params.dateForQuantities = start;
                } else {
                    params['dateForQuantities[start]'] = start;
                    params['dateForQuantities[end]'] = end;
                }
            }

            return params;
        },
    },
    render() {
        const {
            $t: __,
            $options,
            hasCriticalError,
            isAdmin,
            isLoading,
            columns,
            dataTableOptions,
            dropdownItemClass,
            handleShowTrashed,
            isTrashDisplayed,
            periodForQuantities,
            isSingleDayPeriodForQuantities,
            handleRemoveDateForQuantities,
            handleChangeFilters,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="materials" title={__('page.materials.title')}>
                    <CriticalError />
                </Page>
            );
        }

        const pageActions = [
            <Button type="add" to={{ name: 'add-material' }} icon="plus">
                {__('page.materials.action-add')}
            </Button>,
        ];
        if (isAdmin) {
            pageActions.push(
                <Dropdown
                    variant="actions"
                    scopedSlots={{
                        items: () => (
                            <Fragment>
                                <router-link to="/attributes" custom>
                                    {({ navigate }) => (
                                        <li class={dropdownItemClass} onClick={navigate}>
                                            <Icon name="cog" />
                                            {__('page.materials.manage-attributes')}
                                        </li>
                                    )}
                                </router-link>
                                <a
                                    class={dropdownItemClass}
                                    href={`${config.baseUrl}/materials/pdf`}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <Icon name="print" />
                                    {__('page.materials.print-complete-list')}
                                </a>
                            </Fragment>
                        ),
                    }}
                />,
            );
        }

        return (
            <Page
                name="materials"
                title={__('page.materials.title')}
                help={__('page.materials.help')}
                isLoading={isLoading}
                actions={pageActions}
            >
                <div class="Materials">
                    <div class="Materials__filters">
                        <MaterialsFilters onChange={handleChangeFilters} />
                        <div class="Materials__quantities-date">
                            <Datepicker
                                type="date"
                                v-model={this.periodForQuantities}
                                class="Materials__quantities-date__input"
                                placeholder={__('page.materials.display-quantities-at-date')}
                                range
                            />
                            {!!periodForQuantities && (
                                <Button
                                    type="danger"
                                    class="Materials__quantities-date__clear-button"
                                    onClick={handleRemoveDateForQuantities}
                                    icon="backspace"
                                >
                                    {isSingleDayPeriodForQuantities ? __('reset-date') : __('reset-period')}
                                </Button>
                            )}
                        </div>
                    </div>
                    <v-server-table
                        ref="table"
                        name={$options.name}
                        columns={columns}
                        options={dataTableOptions}
                    />
                    <div class="content__footer">
                        <Button
                            onClick={handleShowTrashed}
                            icon={isTrashDisplayed ? 'eye' : 'trash'}
                            type={isTrashDisplayed ? 'success' : 'danger'}
                        >
                            {isTrashDisplayed ? __('display-not-deleted-items') : __('open-trash-bin')}
                        </Button>
                    </div>
                </div>
            </Page>
        );
    },
};
