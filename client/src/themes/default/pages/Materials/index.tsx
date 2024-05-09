import './index.scss';
import Period from '@/utils/period';
import DateTime from '@/utils/datetime';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import { isRequestErrorStatusCode } from '@/utils/errors';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';
import isTruthy from '@/utils/isTruthy';
import formatAmount from '@/utils/formatAmount';
import isValidInteger from '@/utils/isValidInteger';
import showModal from '@/utils/showModal';
import apiMaterials, { UNCATEGORIZED } from '@/stores/api/materials';
import AssignTags from '@/themes/default/modals/AssignTags';
import Fragment from '@/components/Fragment';
import Dropdown from '@/themes/default/components/Dropdown';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import { ServerTable } from '@/themes/default/components/Table';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import TagsList from '@/themes/default/components/TagsList';
import DatePicker from '@/themes/default/components/DatePicker';
import { Group } from '@/stores/api/groups';
import Quantities from './components/Quantities';

import type { ComponentRef, CreateElement } from 'vue';
import type { PaginationParams } from '@/stores/api/@types';
import type { Columns } from '@/themes/default/components/Table';
import type { Filters as CoreFilters } from '@/themes/default/components/MaterialsFilters';
import type { Filters, MaterialWithAvailability as Material } from '@/stores/api/materials';
import type { Tag } from '@/stores/api/tags';

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    isLoading: boolean,
    hasCriticalError: boolean,
    shouldDisplayTrashed: boolean,
    isTrashDisplayed: boolean,
    rawPeriodForQuantities: Period | null,
    periodForQuantitiesIsFullDays: boolean,
    now: DateTime,
};

/** Page de listing du matériel. */
const Materials = defineComponent({
    name: 'Materials',
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        isLoading: false,
        hasCriticalError: false,
        isTrashDisplayed: false,
        shouldDisplayTrashed: false,
        rawPeriodForQuantities: null,
        periodForQuantitiesIsFullDays: false,
        now: DateTime.now(),
    }),
    computed: {
        isAdmin(): boolean {
            return this.$store.getters['auth/is'](Group.ADMIN);
        },

        periodForQuantities(): Period {
            if (this.rawPeriodForQuantities === null) {
                const currentHour = this.now.startOfHour();
                return new Period(currentHour, currentHour.addHour());
            }
            return this.rawPeriodForQuantities;
        },

        filters(): Filters {
            const filters: Filters = {};
            const routeQuery = this.$route?.query ?? {};

            // - Période.
            filters.quantitiesPeriod = this.periodForQuantities;

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

        columns(): Columns<Material> {
            const isBillingEnabled = config.billingMode !== 'none';
            const {
                $t: __,
                $store: store,
                filters,
                handleSetTags,
                isTrashDisplayed,
                handleRestoreItemClick,
                handleDeleteItemClick,
            } = this;

            return [
                {
                    key: 'reference',
                    title: __('reference'),
                    class: 'Materials__cell Materials__cell--ref',
                    sortable: true,
                },
                {
                    key: 'name',
                    title: __('name'),
                    class: 'Materials__cell Materials__cell--name',
                    sortable: true,
                },
                {
                    key: 'description',
                    title: __('description'),
                    class: 'Materials__cell Materials__cell--description',
                    sortable: true,
                    hidden: true,
                    render: (h: CreateElement, { description }: Material) => (
                        (description ?? '').length > 0 ? description : (
                            <span class="Materials__cell__empty">
                                {__('not-specified')}
                            </span>
                        )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'park',
                    title: __('park'),
                    class: 'Materials__cell Materials__cell--park',
                    hidden: true,
                    render(h: CreateElement, { park_id: parkId }: Material) {
                        const parkName = store.getters['parks/parkName'](parkId);
                        return parkName ?? '--';
                    },
                },
                !isTrashDisplayed && {
                    key: 'category',
                    title: __('category'),
                    class: 'Materials__cell Materials__cell--category',
                    render(h: CreateElement, { category_id: categoryId, sub_category_id: subCategoryId }: Material) {
                        const categoryName = store.getters['categories/categoryName'](categoryId);
                        if (!categoryName) {
                            return (
                                <span class="Materials__cell__empty">
                                    {__('not-categorized')}
                                </span>
                            );
                        }

                        const subCategoryName = subCategoryId
                            ? store.getters['categories/subCategoryName'](subCategoryId)
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
                },
                !!(!isTrashDisplayed && isBillingEnabled) && {
                    key: 'rental_price',
                    title: __('rent-price'),
                    class: 'Materials__cell Materials__cell--rental-price',
                    sortable: true,
                    render: (h: CreateElement, material: Material) => (
                        formatAmount(material.rental_price ?? 0)
                    ),
                },
                !isTrashDisplayed && {
                    key: 'replacement_price',
                    title: __('repl-price'),
                    class: 'Materials__cell Materials__cell--replacement-price',
                    sortable: true,
                    hidden: true,
                    render: (h: CreateElement, { replacement_price: replacementPrice }: Material) => (
                        replacementPrice !== null
                            ? formatAmount(replacementPrice)
                            : (
                                <span class="Materials__cell__empty">
                                    {__('not-specified')}
                                </span>
                            )
                    ),
                },
                !isTrashDisplayed && {
                    key: 'stock_quantity',
                    title: __('page.materials.available-qty-total-qty'),
                    class: 'Materials__cell Materials__cell--quantity',
                    sortable: true,
                    render: (h: CreateElement, material: Material) => (
                        <Quantities
                            material={material}
                            parkFilter={filters.park}
                        />
                    ),
                },
                !isTrashDisplayed && {
                    key: 'out_of_order_quantity',
                    title: __('out-of-order-qty'),
                    class: 'Materials__cell Materials__cell--quantity-broken',
                    sortable: true,
                    hidden: true,
                    render(h: CreateElement, material: Material) {
                        const quantityBroken: number = material.out_of_order_quantity;

                        const className = ['Materials__quantity-broken', {
                            'Materials__quantity-broken--exists': quantityBroken > 0,
                        }];

                        return (
                            <span class={className}>
                                {quantityBroken}
                            </span>
                        );
                    },
                },
                !isTrashDisplayed && {
                    key: 'tags',
                    title: __('tags'),
                    class: 'Materials__cell Materials__cell--tags',
                    render: (h: CreateElement, material: Material) => (
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
                    ),
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'Materials__cell Materials__cell--actions',
                    render(h: CreateElement, { id }: Material) {
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
                                <Dropdown>
                                    <Button
                                        type="edit"
                                        to={{ name: 'edit-material', params: { id } }}
                                    >
                                        {__('action-edit')}
                                    </Button>
                                    <Button
                                        type="trash"
                                        onClick={(e: MouseEvent) => {
                                            handleDeleteItemClick(e, id);
                                        }}
                                    >
                                        {__('action-delete')}
                                    </Button>
                                </Dropdown>
                            </Fragment>
                        );
                    },
                },
            ].filter(isTruthy);
        },
    },
    watch: {
        periodForQuantities() {
            this.refreshTable();
        },
    },
    created() {
        // - Binding.
        this.fetch = this.fetch.bind(this);
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('tags/fetch');

        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
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
            if (newFilters.park !== undefined && newFilters.park !== null) {
                query.park = newFilters.park.toString();
            }
            if (newFilters.category !== undefined && newFilters.category !== null) {
                query.category = newFilters.category.toString();
            }
            if (newFilters.subCategory !== undefined && newFilters.subCategory !== null) {
                query.subCategory = newFilters.subCategory.toString();
            }
            if (
                newFilters.tags !== undefined &&
                newFilters.tags !== null &&
                newFilters.tags.length > 0
            ) {
                query.tags = newFilters.tags.join(',');
            }

            this.$router.push({ query });
            this.setTablePage(1);
        },

        handleChangePeriodForQuantities(newPeriod: Period<true> | null, isFullDays: boolean) {
            this.periodForQuantitiesIsFullDays = isFullDays;
            this.rawPeriodForQuantities = newPeriod;
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

        handleRowClick({ id }: Material) {
            this.$router.push({
                name: 'view-material',
                params: { id: id.toString() },
            });
        },

        handleToggleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
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

                this.isTrashDisplayed = this.shouldDisplayTrashed;
                return data;
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.setTablePage(1);
                    return undefined;
                }

                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving materials:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }

            return undefined;
        },

        refreshTable() {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.refresh();
        },

        setTablePage(page: number) {
            (this.$refs.table as ComponentRef<typeof ServerTable>)?.setPage(page);
        },
    },
    render() {
        const {
            $t: __,
            fetch,
            $options,
            hasCriticalError,
            isAdmin,
            isLoading,
            filters,
            columns,
            handleToggleShowTrashed,
            isTrashDisplayed,
            periodForQuantities,
            periodForQuantitiesIsFullDays,
            handleChangePeriodForQuantities,
            handleChangeFilters,
            handleRowClick,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="materials" title={__('page.materials.title')} centered>
                    <CriticalError />
                </Page>
            );
        }

        if (isTrashDisplayed) {
            return (
                <Page
                    name="materials"
                    title={__('page.materials.title-trash')}
                    loading={isLoading}
                    actions={[
                        <Button onClick={handleToggleShowTrashed} icon="eye" type="primary">
                            {__('display-not-deleted-items')}
                        </Button>,
                    ]}
                >
                    <div class="Materials Materials--trashed">
                        <ServerTable
                            ref="table"
                            key="trash"
                            rowClass="Materials__row"
                            columns={columns}
                            fetcher={fetch}
                        />
                    </div>
                </Page>
            );
        }

        return (
            <Page
                name="materials"
                title={__('page.materials.title')}
                help={__('page.materials.help')}
                loading={isLoading}
                actions={[
                    <Button type="add" to={{ name: 'add-material' }} icon="plus" collapsible>
                        {__('page.materials.action-add')}
                    </Button>,
                    <Dropdown>
                        {isAdmin && (
                            <Fragment>
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
                            </Fragment>
                        )}
                        <Button icon="trash" onClick={handleToggleShowTrashed}>
                            {__('open-trash-bin')}
                        </Button>
                    </Dropdown>,
                ].filter(isTruthy)}
            >
                <div class="Materials">
                    <div class="Materials__filters">
                        <MaterialsFilters
                            values={filters}
                            onChange={handleChangeFilters}
                        />
                        <div class="Materials__quantities-date">
                            <DatePicker
                                type={periodForQuantitiesIsFullDays ? 'date' : 'datetime'}
                                value={periodForQuantities}
                                onChange={handleChangePeriodForQuantities}
                                class="Materials__quantities-date__input"
                                withFullDaysToggle
                                withSnippets
                                range
                                v-tooltip={{
                                    placement: 'top',
                                    content: __('page.materials.period-to-display-available-quantities'),
                                }}
                            />
                        </div>
                    </div>
                    <ServerTable
                        ref="table"
                        key="default"
                        name={$options.name}
                        rowClass="Materials__row"
                        columns={columns}
                        fetcher={fetch}
                        onRowClick={handleRowClick}
                    />
                </div>
            </Page>
        );
    },
});

export default Materials;
