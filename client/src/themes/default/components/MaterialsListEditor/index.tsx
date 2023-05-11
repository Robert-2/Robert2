import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import config from '@/globals/config';
import showModal from '@/utils/showModal';
import formatAmount from '@/utils/formatAmount';
import { BookingEntity } from '@/stores/api/bookings';
import apiMaterials from '@/stores/api/materials';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';
import Dropdown from '@/themes/default/components/Dropdown';
import MaterialsStore from './_store';
import ReuseEventMaterials from './modals/ReuseEventMaterials';
import Availability from './components/Availability';
import Quantity from './components/Quantity';
import {
    normalizeFilters,
    getEventMaterialsQuantities,
    materialsHasChanged,
} from './_utils';

import type { PropType } from '@vue/composition-api';
import type { Event, EventMaterial } from '@/stores/api/events';
import type { Material, MaterialWithAvailabilities } from '@/stores/api/materials';
import type { Tag } from '@/stores/api/tags';
import type {
    EventBooking,
    BookingMaterialQuantity,
} from '@/stores/api/bookings';
import type { RawFilters } from './_utils';

export type SelectedQuantities = {
    id: Material['id'],
    requested: number,
    available: number,
};

export type SelectedMaterial = {
    id: Material['id'],
    quantity: number,
};

type MaterialListEditorStoreValue = {
    quantity: number,
};

type Props = {
    /** La sélection de matériel pour le booking. */
    selected: SelectedMaterial[],

    /** Le booking (événement). */
    booking?: EventBooking,

    /** Faut-il utiliser les modèles de liste ? */
    withTemplates: boolean,
};

type Data = {
    isFetched: boolean,
    criticalError: boolean,
    materials: MaterialWithAvailabilities[],
    manualOrder: Array<SelectedQuantities['id']>,
    showSelectedOnly: boolean,
    columns: string[],
    tableOptions: any,
};

const NO_PAGINATION_LIMIT = 100_000;

// @vue/component
const MaterialsListEditor = defineComponent({
    name: 'MaterialsListEditor',
    props: {
        selected: {
            type: Array as PropType<Props['selected']>,
            default: () => [],
        },
        booking: {
            type: Object as PropType<Props['booking']>,
            default: undefined,
        },
        withTemplates: {
            type: Boolean as PropType<Props['withTemplates']>,
            default: false,
        },
    },
    data(): Data {
        const { $t: __, selected, getFilters } = this;
        const hasMaterials = selected.length > 0;

        return {
            isFetched: false,
            criticalError: false,
            materials: [],
            manualOrder: [],
            showSelectedOnly: hasMaterials,
            columns: [
                'child-toggler',
                'qty',
                'reference',
                'name',
                'availability',
                'price',
                'quantity',
                'amount',
                'actions',
            ],
            tableOptions: {
                columnsDropdown: false,
                preserveState: false,
                showChildRowToggler: false,
                orderBy: { column: 'reference', ascending: true },
                perPage: hasMaterials ? NO_PAGINATION_LIMIT : config.defaultPaginationLimit,
                sortable: ['reference', 'name'],
                columnsClasses: {
                    'child-toggler': 'MaterialsListEditor__child-toggler ',
                    'qty': 'MaterialsListEditor__qty ',
                    'reference': 'MaterialsListEditor__ref ',
                    'name': 'MaterialsListEditor__name ',
                    'availability': 'MaterialsListEditor__availability ',
                    'price': 'MaterialsListEditor__price ',
                    'quantity': 'MaterialsListEditor__quantity ',
                    'amount': 'MaterialsListEditor__amount ',
                    'actions': 'MaterialsListEditor__actions ',
                },
                initFilters: getFilters(true, true),
                headings: {
                    'child-toggler': '',
                    'qty': __('qty'),
                    'reference': __('reference'),
                    'name': __('name'),
                    'stock_quantity': __('stock-qty'),
                    'quantity': '',
                    'actions': '',
                },
                customSorting: {
                    custom: (ascending: boolean) => (a: MaterialWithAvailabilities, b: MaterialWithAvailabilities) => {
                        const { showSelectedOnly, manualOrder } = this;
                        let result = null;

                        // - Si on est en mode "sélectionnés uniquement" et qu'au moins l'un
                        //   des deux à un ordre manuellement défini, on l'utilise.
                        if (showSelectedOnly) {
                            const aManualOrderIndex = manualOrder?.indexOf(a.id);
                            const bManualOrderIndex = manualOrder?.indexOf(b.id);
                            if (aManualOrderIndex !== -1 || bManualOrderIndex !== -1) {
                                result = aManualOrderIndex > bManualOrderIndex ? -1 : 1;
                            }
                        }

                        // - Sinon on fallback sur le tri par reference.
                        if (result === null) {
                            result = a.reference.localeCompare(b.reference, undefined, { ignorePunctuation: true });
                        }

                        return ascending || result === 0 ? result : -result;
                    },
                },
                customFilters: [
                    {
                        name: 'park',
                        callback: (row: MaterialWithAvailabilities, parkId: number) => (
                            row.park_id === parkId
                        ),
                    },
                    {
                        name: 'category',
                        callback: (row: MaterialWithAvailabilities, categoryId: number | 'uncategorized') => (
                            (row.category_id === null && categoryId === 'uncategorized') ||
                            row.category_id === categoryId
                        ),
                    },
                    {
                        name: 'subCategory',
                        callback: (row: MaterialWithAvailabilities, subCategoryId: number) => (
                            row.sub_category_id === subCategoryId
                        ),
                    },
                    {
                        name: 'tags',
                        callback: (row: MaterialWithAvailabilities, tags: string[]) => (
                            tags.length === 0 || row.tags.some((tag: Tag) => tags.includes(tag.name))
                        ),
                    },
                    {
                        name: 'onlySelected',
                        callback: (row: MaterialWithAvailabilities, isOnlySelected: boolean) => (
                            !isOnlySelected || this.getQuantity(row) > 0
                        ),
                    },
                ],
            },
        };
    },
    computed: {
        hasMaterials() {
            return (this.selected.length || 0) > 0;
        },

        isFiltered() {
            return Object.keys(this.getFilters(false)).length !== 0;
        },
    },
    mounted() {
        MaterialsStore.commit('init', this.selected);

        // - Actualise la liste du matériel toutes les 30 secondes.
        this.fetchInterval = setInterval(this.fetchMaterials.bind(this), 30_000);
        this.fetchMaterials();
    },
    beforeDestroy() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChanges() {
            const storeMaterials = Object.entries<MaterialListEditorStoreValue>(MaterialsStore.state.materials)
                .map((
                    [id, { quantity }]: [string, MaterialListEditorStoreValue],
                ): BookingMaterialQuantity => ({
                    id: parseInt(id, 10),
                    quantity,
                }));

            if (storeMaterials.every(({ quantity }: SelectedMaterial) => quantity === 0)) {
                this.setSelectedOnly(false);
            }

            this.$emit('change', storeMaterials);
        },

        handleFiltersChanges(filters: RawFilters) {
            const onlySelected = this.showSelectedOnly;
            const newFilters = normalizeFilters({ ...filters, onlySelected });
            this.$refs.dataTableRef.setCustomFilters(newFilters);
        },

        handleShowReuseEventModal() {
            showModal(this.$modal, ReuseEventMaterials, {
                onClose: ({ params }: { params: { event: Event | null } | null }) => {
                    if (params?.event) {
                        this.selectMany(params.event.materials);
                    }
                },
            });
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchMaterials() {
            const { entity, id } = this.booking ?? { entity: null, id: null };

            try {
                if (entity && entity === BookingEntity.EVENT) {
                    this.materials = await apiMaterials.allWhileEvent(id);
                } else {
                    this.materials = await apiMaterials.all({ paginated: false });
                }
                this.$emit('ready');
            } catch {
                this.criticalError = true;
            } finally {
                this.isFetched = true;
            }
        },

        getFilters(extended: boolean = true, isInit: boolean = false) {
            const filters: RawFilters = {};

            if (extended) {
                filters.onlySelected = isInit
                    ? this.selected.length
                    : this.showSelectedOnly;
            }

            ['park', 'category', 'subCategory'].forEach((key: string) => {
                if (this.$route?.query && key in this.$route.query) {
                    filters[key] = this.$route?.query[key];
                }
            });

            if (this.$route?.query?.tags) {
                filters.tags = JSON.parse(this.$route.query.tags);
            }

            return normalizeFilters(filters, extended);
        },

        getQuantity(material: MaterialWithAvailabilities) {
            return MaterialsStore.getters.getQuantity(material.id);
        },

        setQuantity(material: MaterialWithAvailabilities, quantity: number) {
            MaterialsStore.commit('setQuantity', { material, quantity });
            this.handleChanges();
        },

        selectMany(materialsToAdd: EventMaterial[]) {
            const shouldDisplayOnlySelected = this.selected.length === 0;

            materialsToAdd.forEach(({ pivot, ...material }: EventMaterial) => {
                const { quantity } = pivot;
                MaterialsStore.commit('setQuantity', { material, quantity });
            });

            this.handleChanges();

            if (shouldDisplayOnlySelected) {
                this.setSelectedOnly(true);
            }
        },

        setSelectedOnly(onlySelected: boolean) {
            this.$refs.dataTableRef.setCustomFilters({ ...this.getFilters(), onlySelected });
            this.$refs.dataTableRef.setLimit(
                onlySelected ? NO_PAGINATION_LIMIT : config.defaultPaginationLimit,
            );
            this.showSelectedOnly = onlySelected;
        },
    },
    render() {
        const {
            $t: __,
            columns,
            showSelectedOnly,
            hasMaterials,
            handleFiltersChanges,
            setSelectedOnly,
            withTemplates,
            handleShowTemplateUsageModal,
            handleShowReuseEventModal,
            criticalError,
            isFetched,
            materials,
            tableOptions,
            getFilters,
            getQuantity,
            setQuantity,
        } = this;

        if (criticalError) {
            return <div class="MaterialsListEditor"><CriticalError /></div>;
        }

        return (
            <div class="MaterialsListEditor">
                <header class="MaterialsListEditor__header">
                    <MaterialsFilters ref="filtersRef" onChange={handleFiltersChanges} />
                    <div class="MaterialsListEditor__header__extra-filters">
                        {hasMaterials && (
                            <div class="MaterialsListEditor__header__extra-filters__filter">
                                {__('display-only-selected-materials')}
                                <SwitchToggle value={showSelectedOnly} onInput={setSelectedOnly} />
                            </div>
                        )}
                        <Dropdown variant="actions">
                            <template slot="buttonText">
                                {__('add-materials-from')}
                            </template>
                            <template slot="items">
                                {withTemplates && (
                                    <Button
                                        type="add"
                                        class="Dropdown__item"
                                        onClick={handleShowTemplateUsageModal}
                                    >
                                        {__('a-list-template')}
                                    </Button>
                                )}
                                <Button
                                    type="add"
                                    class="Dropdown__item"
                                    onClick={handleShowReuseEventModal}
                                >
                                    {__('another-event')}
                                </Button>
                            </template>
                        </Dropdown>
                    </div>
                </header>
                <div class="MaterialsListEditor__main">
                    {!isFetched && (
                        <div class="MaterialsListEditor__loading">
                            <Loading />
                        </div>
                    )}
                    <v-client-table
                        ref="dataTableRef"
                        name="materialsListEditorTable"
                        data={materials || []}
                        columns={columns}
                        options={tableOptions}
                        scopedSlots={{
                            'qty': ({ row }: { row: MaterialWithAvailabilities }) => (
                                getQuantity(row) > 0 ? `${getQuantity(row)}\u00A0×` : null
                            ),
                            'availability': ({ row }: { row: MaterialWithAvailabilities }) => (
                                <Availability material={row} filters={getFilters()} />
                            ),
                            'price': ({ row }: { row: MaterialWithAvailabilities }) => (
                                <Fragment>
                                    {formatAmount(row.rental_price ?? 0)} <Icon name="times" />
                                </Fragment>
                            ),
                            'quantity': ({ row }: { row: MaterialWithAvailabilities }) => (
                                <Quantity
                                    material={row}
                                    initialQuantity={getQuantity(row)}
                                    onChange={setQuantity}
                                />
                            ),
                            'amount': ({ row }: { row: MaterialWithAvailabilities }) => (
                                formatAmount((row.rental_price ?? 0) * getQuantity(row))
                            ),
                            'actions': ({ row }: { row: MaterialWithAvailabilities }) => (
                                getQuantity(row) > 0
                                    ? (
                                        <Button
                                            type="danger"
                                            icon="backspace"
                                            onClick={() => { setQuantity(row, 0); }}
                                        />
                                    )
                                    : null
                            ),
                        }}
                    />
                    {(isFetched && hasMaterials) && (
                        <div class="MaterialsListEditor__add-more">
                            <Button
                                icon={showSelectedOnly ? 'chevron-down' : 'chevron-up'}
                                onClick={() => { setSelectedOnly(!showSelectedOnly); }}
                            >
                                {(
                                    showSelectedOnly
                                        ? __('display-all-materials-to-add-some')
                                        : __('display-only-selected-materials')
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    },
});

export {
    getEventMaterialsQuantities,
    materialsHasChanged,
};

export default MaterialsListEditor;
