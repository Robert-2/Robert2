import './index.scss';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import { isRequestErrorStatusCode } from '@/utils/errors';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';
import initColumnsDisplay from '@/utils/initColumnsDisplay';
import formatAmount from '@/utils/formatAmount';
import isValidInteger from '@/utils/isValidInteger';
import isSameDate from '@/utils/isSameDate';
import showModal from '@/utils/showModal';
import apiMaterials, { UNCATEGORIZED } from '@/stores/api/materials';
import AssignTags from '@/themes/default/modals/AssignTags';
import Fragment from '@/components/Fragment';
import Dropdown from '@/themes/default/components/Dropdown';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import TagsList from '@/themes/default/components/TagsList';
import Datepicker from '@/themes/default/components/Datepicker';
import { Group } from '@/stores/api/groups';
import Quantities from './components/Quantities';

import type { PaginationParams } from '@/stores/api/@types';
import type { ServerTableInstance } from 'vue-tables-2-premium';
import type { Filters as CoreFilters } from '@/themes/default/components/MaterialsFilters';
import type { Filters, MaterialWithAvailabilities as Material } from '@/stores/api/materials';
import type { Tag } from '@/stores/api/tags';

type InstanceProperties = {
    todayTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    today: string,
    isLoading: boolean,
    hasCriticalError: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
    periodForQuantities: [string, string] | null,
    columns: string[],
    options: any,
};

// @vue/component
const Materials = defineComponent({
    name: 'Materials',
    setup: (): InstanceProperties => ({
        todayTimer: undefined,
    }),
    data(): Data {
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
            columns = columns.filter((column: string) => (
                column !== 'rental_price'
            ));
        }

        return {
            hasCriticalError: false,
            isLoading: false,
            shouldDisplayTrashed: false,
            isTrashDisplayed: false,
            today: moment().format('YYYY-MM-DD'),
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
                columnsClasses: {
                    reference: 'Materials__cell Materials__cell--ref ',
                    name: 'Materials__cell Materials__cell--name ',
                    park: 'Materials__cell Materials__cell--park ',
                    category: 'Materials__cell Materials__cell--category ',
                    description: 'Materials__cell Materials__cell--description ',
                    rental_price: 'Materials__cell Materials__cell--rental-price ',
                    replacement_price: 'Materials__cell Materials__cell--replacement-price ',
                    stock_quantity: 'Materials__cell Materials__cell--quantity ',
                    out_of_order_quantity: 'Materials__cell Materials__cell--quantity-broken ',
                    tags: 'Materials__cell Materials__cell--tags ',
                    actions: 'Materials__cell Materials__cell--actions ',
                },
                rowClassCallback: () => 'Materials__row',
                requestFunction: this.fetch.bind(this),
            },
        };
    },
    computed: {
        isAdmin(): boolean {
            return this.$store.getters['auth/is'](Group.ADMIN);
        },

        datesForQuantities() {
            if (this.periodForQuantities === null) {
                const { today } = this;
                return [today, today];
            }
            return this.periodForQuantities;
        },

        filters(): Filters {
            const filters: Filters = {};
            const routeQuery = this.$route?.query ?? {};

            // - Période.
            const [start, end] = this.datesForQuantities;
            filters.dateForQuantities = !isSameDate(start, end)
                ? { start, end }
                : start;

            // - Catégorie.
            if ('category' in routeQuery) {
                if (routeQuery.category === UNCATEGORIZED) {
                    filters.category = UNCATEGORIZED;
                } else if (isValidInteger(routeQuery.category)) {
                    filters.category = parseInt(routeQuery.category, 10);
                }
            }

            // - Sous-Catégorie.
            if (
                'subCategory' in routeQuery &&
                isValidInteger(routeQuery.subCategory) &&
                filters.category !== null &&
                filters.category !== UNCATEGORIZED
            ) {
                filters.subCategory = parseInt(routeQuery.subCategory, 10);
            }

            // - Park.
            if ('park' in routeQuery && isValidInteger(routeQuery.park)) {
                filters.park = parseInt(routeQuery.park, 10);
            }

            // - Tags.
            if ('tags' in routeQuery && typeof routeQuery.tags === 'string') {
                filters.tags = routeQuery.tags.split(',')
                    .map((rawFilter: string) => rawFilter.trim())
                    .filter((rawFilter: string) => isValidInteger(rawFilter))
                    .map((rawFilter: string) => parseInt(rawFilter, 10));
            }

            return filters;
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
                stock_quantity: __('page.materials.available-qty-total-qty'),
                out_of_order_quantity: __('out-of-order-qty'),
                tags: __('tags'),
                actions: '',
            };
            const sortable = [
                'reference',
                'name',
                'description',
                'rental_price',
                'replacement_price',
                'stock_quantity',
                'out_of_order_quantity',
            ];

            return { ...this.options, headings, sortable };
        },

        columnsRender() {
            return {
                park: ({ row: { park_id: parkId } }: { row: Material }) => {
                    const parkName = this.$store.getters['parks/parkName'](parkId);
                    return parkName ?? '--';
                },
                category: ({ row: material }: { row: Material }) => {
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
                                <div class="Materials__sub-category">
                                    <Icon name="arrow-right" />&nbsp;{subCategoryName}
                                </div>
                            )}
                        </Fragment>
                    );
                },
                rental_price: ({ row: material }: { row: Material }) => (
                    formatAmount(material.rental_price ?? 0)
                ),
                replacement_price: ({ row: material }: { row: Material }) => (
                    formatAmount(material.replacement_price ?? 0)
                ),
                stock_quantity: ({ row: material }: { row: Material }) => (
                    <Quantities material={material} />
                ),
                out_of_order_quantity: ({ row: material }: { row: Material }) => {
                    const {
                        out_of_order_quantity: quantityBroken,
                    } = material;

                    return quantityBroken! > 0
                        ? <span class="Materials__quantity-broken">{quantityBroken}</span>
                        : null;
                },
                tags: ({ row: material }: { row: Material }) => {
                    const { $t: __, isTrashDisplayed, handleSetTags } = this;

                    return (
                        <div
                            class="Materials__tags-list"
                            role="button"
                            onClick={handleSetTags(material)}
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
                actions: ({ row: { id } }: { row: Material }) => {
                    const {
                        isTrashDisplayed,
                        handleRestoreItemClick,
                        handleDeleteItemClick,
                    } = this;

                    if (isTrashDisplayed) {
                        return (
                            <Fragment>
                                <Button
                                    type="restore"
                                    onClick={(e: MouseEvent) => {
                                        handleRestoreItemClick(e, id);
                                    }}
                                />
                                <Button
                                    type="delete"
                                    onClick={(e: MouseEvent) => {
                                        handleDeleteItemClick(e, id);
                                    }}
                                />
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment>
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
                                onClick={(e: MouseEvent) => {
                                    handleDeleteItemClick(e, id);
                                }}
                            />
                        </Fragment>
                    );
                },
            };
        },
    },
    watch: {
        periodForQuantities() {
            this.refreshTable();
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('tags/fetch');

        // - Actualise la date courante toutes les 10 minutes.
        this.todayTimer = setInterval(
            () => { this.today = moment().format('YYYY-MM-DD'); },
            600_000,
        );
    },
    beforeDestroy() {
        if (this.todayTimer) {
            clearInterval(this.todayTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeFilters(newFilters: CoreFilters) {
            const query: Record<string, string> = {};
            if (newFilters.park !== undefined) {
                query.park = newFilters.park.toString();
            }
            if (newFilters.category !== undefined) {
                query.category = newFilters.category.toString();
            }
            if (newFilters.subCategory !== undefined) {
                query.subCategory = newFilters.subCategory.toString();
            }
            if (newFilters.tags !== undefined && newFilters.tags.length > 0) {
                query.tags = newFilters.tags.join(',');
            }

            this.$router.push({ query });
            this.setTablePage(1);
        },

        handleChangePeriodForQuantities([start, end]: [string, string]) {
            this.periodForQuantities = [start, end];
        },

        handleRowClick({ row: { id } }: { row: Material }) {
            this.$router.push({
                name: 'view-material',
                params: { id: id.toString() },
            });
        },

        async handleDeleteItemClick(e: MouseEvent, id: Material['id']) {
            e.stopPropagation();
            const { $t: __ } = this;
            const isSoft = !this.isTrashDisplayed;

            const isConfirmed = await confirm({
                type: 'danger',
                text: isSoft
                    ? __('page.materials.confirm-delete')
                    : __('page.materials.confirm-permanently-delete'),
                confirmButtonText: isSoft
                    ? __('yes-trash')
                    : __('yes-permanently-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.isLoading = true;
            try {
                await apiMaterials.remove(id);
                this.$toasted.success(__('page.materials.deleted'));
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItemClick(e: MouseEvent, id: Material['id']) {
            e.stopPropagation();
            const { $t: __ } = this;

            const isConfirmed = await confirm({
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
                this.refreshTable();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleSetTags({ id, name, tags }: Material) {
            return (e: MouseEvent) => {
                e.stopPropagation();

                if (this.isTrashDisplayed) {
                    return;
                }

                showModal(this.$modal, AssignTags, {
                    name,
                    initialTags: tags,
                    persister: (newTags: Array<Tag['id']>) => (
                        apiMaterials.update(id, { tags: newTags })
                    ),
                    onClose: () => {
                        this.refreshTable();
                    },
                });
            };
        },

        handleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.isTrashDisplayed = !this.isTrashDisplayed;
            this.setTablePage(1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch(pagination: PaginationParams) {
            this.isLoading = true;
            const { filters } = this;

            try {
                const data = await apiMaterials.all({
                    paginated: true,
                    ...pagination,
                    ...filters,
                    deleted: this.shouldDisplayTrashed,
                });

                return { data };
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.setTablePage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error ocurred while retrieving materials:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

        refreshTable() {
            (this.$refs.table as ServerTableInstance | undefined)?.refresh();
        },

        setTablePage(page: number) {
            (this.$refs.table as ServerTableInstance | undefined)?.setPage(page);
        },
    },
    render() {
        const {
            $t: __,
            $options,
            hasCriticalError,
            isAdmin,
            isLoading,
            filters,
            columns,
            columnsRender,
            dataTableOptions,
            handleShowTrashed,
            isTrashDisplayed,
            datesForQuantities,
            handleChangePeriodForQuantities,
            handleChangeFilters,
            handleRowClick,
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
                <Dropdown>
                    <Button
                        icon="cog"
                        to={{ name: 'attributes' }}
                    >
                        {__('page.materials.manage-attributes')}
                    </Button>
                    <Button
                        icon="print"
                        to={`${config.baseUrl}/materials/pdf`}
                        external
                    >
                        {__('page.materials.print-complete-list')}
                    </Button>
                </Dropdown>,
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
                        <MaterialsFilters
                            values={filters}
                            onChange={handleChangeFilters}
                        />
                        <div class="Materials__quantities-date">
                            <Datepicker
                                type="date"
                                value={datesForQuantities}
                                onChange={handleChangePeriodForQuantities}
                                class="Materials__quantities-date__input"
                                range
                                v-tooltip={{
                                    placement: 'top',
                                    content: __('page.materials.date-to-display-available-quantities'),
                                }}
                            />
                        </div>
                    </div>
                    <v-server-table
                        ref="table"
                        name={$options.name}
                        columns={columns}
                        options={dataTableOptions}
                        onRow-click={handleRowClick}
                        scopedSlots={columnsRender}
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
});

export default Materials;
