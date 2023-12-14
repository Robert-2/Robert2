import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import HttpCode from 'status-code-enum';
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
import Datepicker from '@/themes/default/components/Datepicker';
import { Group } from '@/stores/api/groups';
import Quantities from './components/Quantities';

import type { ComponentRef, CreateElement } from 'vue';
import type { PaginationParams } from '@/stores/api/@types';
import type { Column } from '@/themes/default/components/Table';
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
    rawPeriodForQuantities: [string, string] | null,
};

/** Page de listing du matériel. */
const Materials = defineComponent({
    name: 'Materials',
    setup: (): InstanceProperties => ({
        todayTimer: undefined,
    }),
    data: (): Data => ({
        isLoading: false,
        hasCriticalError: false,
        isTrashDisplayed: false,
        shouldDisplayTrashed: false,
        today: moment().format('YYYY-MM-DD'),
        rawPeriodForQuantities: null,
    }),
    computed: {
        isAdmin(): boolean {
            return this.$store.getters['auth/is'](Group.ADMIN);
        },

        periodForQuantities() {
            if (this.rawPeriodForQuantities === null) {
                const { today } = this;
                return [today, today];
            }
            return this.rawPeriodForQuantities;
        },

        filters(): Filters {
            const filters: Filters = {};
            const routeQuery = this.$route?.query ?? {};

            // - Période.
            const [start, end] = this.periodForQuantities;
            filters.quantitiesPeriod = { start, end };

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

        columns(): Array<Column<Material>> {
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
                                <span class="Materials__not-categorized">
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
                    render: (h: CreateElement, material: Material) => (
                        formatAmount(material.replacement_price ?? 0)
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
                        const quantityBroken: number = (() => material.out_of_order_quantity!)();

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
                },
            ].filter(isTruthy);
        },
    },
    watch: {
        rawPeriodForQuantities() {
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
            this.rawPeriodForQuantities = start !== null && end !== null
                ? [start, end]
                : null;
        },

        handleRowClick({ id }: Material) {
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

        handleToggleShowTrashed() {
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

        if (isTrashDisplayed) {
            return (
                <Page
                    name="materials"
                    title={__('page.materials.title-trash')}
                    isLoading={isLoading}
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
                isLoading={isLoading}
                actions={[
                    <Button type="add" to={{ name: 'add-material' }} icon="plus">
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
                            <Datepicker
                                type="date"
                                value={periodForQuantities}
                                onChange={handleChangePeriodForQuantities}
                                class="Materials__quantities-date__input"
                                withSnippets
                                range
                                v-tooltip={{
                                    placement: 'top',
                                    content: __('page.materials.date-to-display-available-quantities'),
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
