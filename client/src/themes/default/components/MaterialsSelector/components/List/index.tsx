import './index.scss';
import isEqual from 'lodash/isEqual';
import stringIncludes from '@/utils/stringIncludes';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import Availability from './Availability';
import Quantity from './Quantity';
import store from '../../store';

import type { PropType } from '@vue/composition-api';
import type { Tag } from '@/stores/api/tags';
import type { SelectedQuantities, Filters } from '../../_types';
import type { MaterialWithAvailabilities as Material } from '@/stores/api/materials';

type FilterResolver<T extends keyof Filters> = (
    (material: Material, filter: NonNullable<Filters[T]>) => boolean
);

type Props = {
    /** La liste de tout le matériel avec les quantités disponibles. */
    materials: Material[],

    /** Les filtres utilisés pour éventuellement filtrer le matériel. */
    filters?: Filters,
};

type Data = {
    columns: string[],
    tableOptions: any,
    openChildRows: Array<Material['id']>,
    manualOrder: Array<SelectedQuantities['id']>,
};

const NO_PAGINATION_LIMIT = 100_000;

// @vue/component
const MaterialsSelectorList = defineComponent({
    name: 'MaterialsSelectorList',
    props: {
        materials: {
            type: Array as PropType<Required<Props>['materials']>,
            required: true,
        },
        filters: {
            type: Object as PropType<Required<Props>['filters']>,
            default: () => ({}),
        },
    },
    emits: ['requestShowAllMaterials'],
    data(): Data {
        const { filters } = this;

        return {
            manualOrder: [],
            openChildRows: [],
            columns: [
                'child-toggler',
                'quantity',
                'name',
                'availability',
                'price',
                'quantity-input',
                'amount',
                'actions',
            ],
            tableOptions: {
                filterable: false,
                columnsDropdown: false,
                preserveState: false,
                filterByColumn: false,
                showChildRowToggler: false,
                orderBy: { column: 'reference', ascending: true },
                perPage: filters.onlySelected ? NO_PAGINATION_LIMIT : config.defaultPaginationLimit,
                sortable: ['reference', 'name'],
                columnsClasses: {
                    'child-toggler': 'MaterialsSelectorList__col MaterialsSelectorList__col--child-toggler ',
                    'quantity': 'MaterialsSelectorList__col MaterialsSelectorList__col--quantity ',
                    'name': 'MaterialsSelectorList__col MaterialsSelectorList__col--name ',
                    'availability': 'MaterialsSelectorList__col MaterialsSelectorList__col--availability ',
                    'price': 'MaterialsSelectorList__col MaterialsSelectorList__col--price ',
                    'quantity-input': 'MaterialsSelectorList__col MaterialsSelectorList__col--quantity-input ',
                    'amount': 'MaterialsSelectorList__col MaterialsSelectorList__col--amount ',
                    'actions': 'MaterialsSelectorList__col MaterialsSelectorList__col--actions ',
                },
                initFilters: filters,
                customSorting: {
                    custom: (ascending: boolean) => (a: Material, b: Material) => {
                        const { filters: _filters, manualOrder } = this;
                        let result = null;

                        // - Si on est en mode "sélectionnés uniquement" et qu'au moins l'un
                        //   des deux à un ordre manuellement défini, on l'utilise.
                        if (_filters.onlySelected) {
                            const aManualOrderIndex = manualOrder?.indexOf(a.id);
                            const bManualOrderIndex = manualOrder?.indexOf(b.id);
                            if (aManualOrderIndex !== -1 || bManualOrderIndex !== -1) {
                                result = aManualOrderIndex > bManualOrderIndex ? -1 : 1;
                            }
                        }

                        // - Sinon on fallback sur le tri par nom.
                        if (result === null) {
                            result = a.name.localeCompare(b.name, undefined, { ignorePunctuation: true });
                        }

                        return ascending || result === 0 ? result : -result;
                    },
                },
            },
        };
    },
    computed: {
        filteredMaterials() {
            const { materials, filters } = this;

            const filterResolvers: { [T in keyof Filters]: FilterResolver<T> } = {
                search: ({ name, reference }: Material, query: NonNullable<Filters['search']>) => {
                    query = query.trim();
                    if (query.length < 2) {
                        return true;
                    }

                    return (
                        stringIncludes(name, query) ||
                        reference.toLowerCase().includes(query.toLowerCase())
                    );
                },
                park: (material: Material, parkId: NonNullable<Filters['park']>) => (
                    material.park_id === parkId
                ),
                category: (material: Material, categoryId: NonNullable<Filters['category']>) => (
                    (material.category_id === null && categoryId === 'uncategorized') ||
                    material.category_id === categoryId
                ),
                subCategory: (material: Material, subCategoryId: NonNullable<Filters['subCategory']>) => (
                    material.sub_category_id === subCategoryId
                ),
                tags: (material: Material, tags: Filters['tags']) => (
                    tags.length === 0 || material.tags.some((tag: Tag) => tags.includes(tag.id))
                ),
                onlySelected: (material: Material, isOnlySelected: Filters['onlySelected']) => (
                    !isOnlySelected || this.getQuantity(material) > 0
                ),
            };

            return materials.filter((material: Material) => (
                !(Object.entries(filterResolvers) as Array<[keyof Filters, FilterResolver<keyof Filters>]>).some(
                    <T extends keyof Filters>([field, filterResolver]: [T, FilterResolver<T>]) => (
                        filters[field] ? !filterResolver(material, filters[field]!) : false
                    ),
                )
            ));
        },

        isMaterialsEmpty(): boolean {
            return this.materials.length === 0;
        },

        isSelectionEmpty(): boolean {
            return store.getters.isEmpty;
        },

        isFilteredEmpty(): boolean {
            return this.filteredMaterials.length === 0;
        },

        isEmpty(): boolean {
            // - S'il n'y a pas de matériel.
            if (this.materials.length === 0) {
                return true;
            }

            return this.filters.onlySelected && this.isSelectionEmpty;
        },
    },
    watch: {
        openChildRows(openChildRows: Array<Material['id']>) {
            const $coreTable = this.$refs.table?.$refs.table;
            if ($coreTable) {
                $coreTable.openChildRows = [...openChildRows];
            }
        },

        filters(newFilters: Filters, oldFilters: Filters) {
            this.$refs.table.setPage(1);

            if (oldFilters.onlySelected !== newFilters.onlySelected) {
                this.$refs.table.setLimit(
                    newFilters.onlySelected
                        ? NO_PAGINATION_LIMIT
                        : config.defaultPaginationLimit,
                );
            }
        },
    },
    mounted() {
        // - Synchronize manuellement les "child rows" du Table vu qu'il
        //   n'y a qu'une API impérative de disponible.
        const $coreTable = this.$refs.table.$refs.table.openChildRows;
        this.$watch(
            () => $coreTable.openChildRows,
            (coreTableOpenChildRows: Array<Material['id']>) => {
                if (!isEqual(coreTableOpenChildRows, this.openChildRows)) {
                    $coreTable.openChildRows = [...this.openChildRows];
                }
            },
        );
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleShowAllMaterials() {
            this.$emit('requestShowAllMaterials');
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        getQuantity(material: Material) {
            return store.getters.getQuantity(material.id, this.list?.id ?? null);
        },

        setQuantity(material: Material, quantity: number) {
            const listId = this.list?.id ?? null;
            store.commit('setQuantity', { material, quantity, listId });
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.MaterialsSelector.list.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            list,
            filters,
            columns,
            filteredMaterials,
            isMaterialsEmpty,
            isSelectionEmpty,
            isFilteredEmpty,
            tableOptions,
            getQuantity,
            setQuantity,
            handleShowAllMaterials,
        } = this;

        const isEmpty = (
            // - S'il n'y a pas de matériel à afficher.
            isMaterialsEmpty ||

            // - Ou, si on est en mode "Sélection uniquement" et qu'il n'y a pas de sélection.
            (isSelectionEmpty && filters.onlySelected) ||

            // - Ou, s'il n'y a pas de résultats selon les critères de recherche courants.
            isFilteredEmpty
        );
        const renderEmptyMessage = (): JSX.Element | null => {
            if (!isEmpty) {
                return null;
            }

            if (isMaterialsEmpty) {
                return (
                    <EmptyMessage
                        size="small"
                        message={__('empty-state.no-materials')}
                    />
                );
            }

            if (isSelectionEmpty && filters.onlySelected) {
                return (
                    <EmptyMessage
                        size="small"
                        message={__('empty-state.no-selection')}
                        action={{
                            type: 'primary',
                            label: __('actions.show-all-materials-to-add-some'),
                            onClick: handleShowAllMaterials,
                        }}
                    />
                );
            }

            return (
                <EmptyMessage
                    size="small"
                    type="search"
                    message={__('empty-state.no-filters-results')}
                />
            );
        };

        const classNames = ['MaterialsSelectorList', {
            'MaterialsSelectorList--empty': isEmpty,
        }];

        return (
            <div class={classNames}>
                {renderEmptyMessage()}
                <div class="MaterialsSelectorList__table">
                    <v-client-table
                        ref="table"
                        data={filteredMaterials}
                        columns={columns}
                        options={tableOptions}
                        scopedSlots={{
                            'name': ({ row: material }: { row: Material }) => (
                                <span class="MaterialsSelectorList__material-name" ref={`items[${material.id}]`}>
                                    {material.name}
                                    <span class="MaterialsSelectorList__material-name__reference">
                                        {__('global.ref-ref', { reference: material.reference })}
                                    </span>
                                </span>
                            ),
                            'quantity': ({ row: material }: { row: Material }) => (
                                getQuantity(material) > 0 ? `${getQuantity(material)}\u00A0×` : null
                            ),
                            'availability': ({ row: material }: { row: Material }) => (
                                <Availability
                                    list={list}
                                    material={material}
                                />
                            ),
                            'price': ({ row: material }: { row: Material }) => (
                                <Fragment>
                                    {formatAmount(material.rental_price ?? 0)}&nbsp;<Icon name="times" />
                                </Fragment>
                            ),
                            'quantity-input': ({ row: material }: { row: Material }) => (
                                <Quantity
                                    material={material}
                                    quantity={getQuantity(material)}
                                    onChange={setQuantity}
                                />
                            ),
                            'amount': ({ row: material }: { row: Material }) => (
                                formatAmount((material.rental_price ?? 0) * getQuantity(material))
                            ),
                            'actions': ({ row: material }: { row: Material }) => (
                                getQuantity(material) > 0
                                    ? (
                                        <Button
                                            type="danger"
                                            icon="backspace"
                                            onClick={() => { setQuantity(material, 0); }}
                                        />
                                    )
                                    : null
                            ),
                        }}
                    />
                </div>
            </div>
        );
    },
});

export default MaterialsSelectorList;
