import './index.scss';
import Decimal from 'decimal.js';
import isEqual from 'lodash/isEqual';
import stringIncludes from '@/utils/stringIncludes';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';
import StateMessage, { State } from '@/themes/default/components/StateMessage';
import MaterialPopover from '@/themes/default/components/Popover/Material';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import Availability from './Availability';
import Quantity from './Quantity';
import store from '../../store';

import type { Tag } from '@/stores/api/tags';
import type { PropType } from '@vue/composition-api';
import type { MaterialWithAvailability as Material } from '@/stores/api/materials';
import type { ClientTableInstance } from 'vue-tables-2-premium';
import type { Filters } from '../../_types';

type FilterResolver<T extends keyof Filters> = (
    (material: Material, filter: NonNullable<Filters[T]>) => boolean
);

type Props = {
    /** La liste de tout le matériel avec les quantités disponibles. */
    materials: Material[],

    /** Les filtres utilisés pour éventuellement filtrer le matériel. */
    filters?: Filters,

    /** Permet de choisir si on veut afficher les montants de location ou non. */
    withRentalPrices: boolean,
};

type Data = {
    tableOptions: any,
    openChildRows: Array<Material['id']>,
};

const NO_PAGINATION_LIMIT = 100_000;

/** Liste de matériel d'un événement. */
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
        withRentalPrices: {
            type: Boolean as PropType<Props['withRentalPrices']>,
            required: true,
        },
    },
    emits: ['requestShowAllMaterials'],
    data(): Data {
        const { filters } = this;

        return {
            openChildRows: [],
            tableOptions: {
                filterable: false,
                columnsDropdown: false,
                preserveState: false,
                filterByColumn: false,
                showChildRowToggler: false,
                orderBy: { column: 'name', ascending: true },
                perPage: filters.onlySelected ? NO_PAGINATION_LIMIT : config.defaultPaginationLimit,
                sortable: ['name'],
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
                rowClassCallback: () => 'MaterialsSelectorList__row',
                initFilters: filters,
            },
        };
    },
    computed: {
        filteredMaterials(): Material[] {
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

        columns(): string[] {
            const { withRentalPrices } = this;

            return [
                'quantity',
                'name',
                'availability',
                withRentalPrices && 'price',
                'quantity-input',
                withRentalPrices && 'amount',
                'actions',
            ].filter(Boolean) as string[];
        },
    },
    watch: {
        openChildRows(openChildRows: Array<Material['id']>) {
            const $table = (this.$refs.table as ClientTableInstance | undefined);
            const $coreTable = $table?.$refs.table;
            if ($coreTable) {
                $coreTable.openChildRows = [...openChildRows];
            }
        },

        filters(newFilters: Filters, oldFilters: Filters) {
            const $table = (this.$refs.table as ClientTableInstance | undefined);
            if ($table === undefined) {
                return;
            }

            $table.setPage(1);

            if (oldFilters.onlySelected !== newFilters.onlySelected) {
                $table.setLimit(
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
        const $table = (this.$refs.table as ClientTableInstance | undefined);
        const $coreTable = $table?.$refs.table;
        if (undefined !== $coreTable) {
            this.$watch(
                () => $coreTable.openChildRows,
                (coreTableOpenChildRows: Array<Material['id']>) => {
                    if (!isEqual(coreTableOpenChildRows, this.openChildRows)) {
                        $coreTable.openChildRows = [...this.openChildRows];
                    }
                },
            );
        }
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
            return store.getters.getQuantity(material.id);
        },

        setQuantity(material: Material, quantity: number) {
            store.commit('setQuantity', { material, quantity });
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
        const renderState = (): JSX.Element | null => {
            if (!isEmpty) {
                return null;
            }

            if (isMaterialsEmpty) {
                return (
                    <StateMessage
                        type={State.EMPTY}
                        size="small"
                        message={__('empty-state.no-materials')}
                    />
                );
            }

            if (isSelectionEmpty && filters.onlySelected) {
                return (
                    <StateMessage
                        type={State.EMPTY}
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
                <StateMessage
                    type={State.NO_RESULT}
                    size="small"
                    message={__('empty-state.no-filters-results')}
                />
            );
        };

        const classNames = ['MaterialsSelectorList', {
            'MaterialsSelectorList--empty': isEmpty,
        }];

        return (
            <div class={classNames}>
                {renderState()}
                <div class="MaterialsSelectorList__table">
                    <v-client-table
                        ref="table"
                        data={filteredMaterials}
                        columns={columns}
                        options={tableOptions}
                        scopedSlots={{
                            'name': ({ row: material }: { row: Material }) => (
                                <MaterialPopover material={material}>
                                    <span class="MaterialsSelectorList__material-name" ref={`items[${material.id}]`}>
                                        {material.name}
                                        <span class="MaterialsSelectorList__material-name__reference">
                                            {__('global.ref-ref', { reference: material.reference })}
                                        </span>
                                    </span>
                                </MaterialPopover>
                            ),
                            'quantity': ({ row: material }: { row: Material }) => (
                                getQuantity(material) > 0 ? `${getQuantity(material)}\u00A0×` : null
                            ),
                            'availability': ({ row: material }: { row: Material }) => (
                                <Availability
                                    // NOTE: Problème dans `vue-tables-2` qui utilise des indexes dans les `key`
                                    // @see https://github.com/matfish2/vue-tables-2/blob/master/templates/VtTableBody.vue#L9
                                    key={`${material.id}--availability`}
                                    material={material}
                                    filters={filters}
                                />
                            ),
                            'price': ({ row: material }: { row: Material }) => (
                                <Fragment>
                                    {formatAmount(material.rental_price ?? 0)}&nbsp;<Icon name="times" />
                                </Fragment>
                            ),
                            'quantity-input': ({ row: material }: { row: Material }) => (
                                <Quantity
                                    // NOTE: Problème dans `vue-tables-2` qui utilise des indexes dans les `key`
                                    // @see https://github.com/matfish2/vue-tables-2/blob/master/templates/VtTableBody.vue#L9
                                    key={`${material.id}--quantity`}
                                    material={material}
                                    quantity={getQuantity(material)}
                                    onChange={setQuantity}
                                />
                            ),
                            'amount': ({ row: material }: { row: Material }) => {
                                const rentalPrice = material.rental_price ?? new Decimal(0);
                                const quantity = getQuantity(material);
                                return formatAmount(rentalPrice.times(quantity));
                            },
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
