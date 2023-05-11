import './index.scss';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { isRequestErrorStatusCode } from '@/utils/errors';
import config from '@/globals/config';
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
import Quantities from './components/Quantities';

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
                templates: {
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
                        const filters = this.getFilters();
                        return (
                            <Quantities
                                material={material}
                                parkFilter={filters.park}
                            />
                        );
                    },
                    out_of_order_quantity: (h, material) => {
                        const {
                            out_of_order_quantity: quantityBroken,
                        } = material;

                        return quantityBroken > 0
                            ? <span class="Materials__quantity-broken">{quantityBroken}</span>
                            : null;
                    },
                    tags: (h, material) => {
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
                    actions: (h, { id }) => {
                        const {
                            isTrashDisplayed,
                            handleRestoreItemClick,
                            handleDeleteItemClick,
                        } = this;

                        if (isTrashDisplayed) {
                            return (
                                <div>
                                    <Button
                                        type="restore"
                                        onClick={(e) => { handleRestoreItemClick(e, id); }}
                                    />
                                    <Button
                                        type="delete"
                                        onClick={(e) => { handleDeleteItemClick(e, id); }}
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
                                    onClick={(e) => { handleDeleteItemClick(e, id); }}
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

        datesForQuantities() {
            if (this.periodForQuantities === null) {
                const { today } = this;
                return [today, today];
            }

            return this.periodForQuantities;
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
    },
    watch: {
        periodForQuantities() {
            this.$refs.table.refresh();
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('tags/fetch');

        // - Actualise la date courante toutes les 10 minutes.
        this.todayTimer = setInterval(() => {
            this.today = moment().format('YYYY-MM-DD');
        }, 600_000);
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

        handleChangeFilters() {
            this.$refs.table.setPage(1);
        },

        handleChangePeriodForQuantities([start, end]) {
            this.periodForQuantities = [start, end];
        },

        handleRowClick({ row }) {
            const { id } = row;
            this.$router.push({ name: 'view-material', params: { id } });
        },

        async handleDeleteItemClick(e, id) {
            e.stopPropagation();
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
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isLoading = false;
            }
        },

        async handleRestoreItemClick(e, id) {
            e.stopPropagation();
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
                this.$refs.table.refresh();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-restoring'));
            } finally {
                this.isLoading = false;
            }
        },

        handleSetTags({ id, name, tags }) {
            return (e) => {
                e.stopPropagation();

                if (this.isTrashDisplayed) {
                    return;
                }

                showModal(this.$modal, AssignTags, {
                    name,
                    initialTags: tags,
                    persister: (newTags) => (
                        apiMaterials.update(id, { tags: newTags })
                    ),
                    onClose: () => {
                        this.$refs.table.refresh();
                    },
                });
            };
        },

        handleShowTrashed() {
            this.shouldDisplayTrashed = !this.shouldDisplayTrashed;
            this.isTrashDisplayed = !this.isTrashDisplayed;
            this.$refs.table.setPage(1);
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
            } catch (error) {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorRangeNotSatisfiable)) {
                    this.$refs.table.setPage(1);
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

            const [start, end] = this.datesForQuantities;

            if (isSameDate(start, end)) {
                params.dateForQuantities = start;
            } else {
                params['dateForQuantities[start]'] = start;
                params['dateForQuantities[end]'] = end;
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
