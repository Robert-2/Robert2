import './index.scss';
import {
    toRefs,
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    reactive,
} from '@vue/composition-api';
import { useQuery } from 'vue-query';
import Fragment from '@/themes/default/components/Fragment';
import config from '@/globals/config';
import useI18n from '@/hooks/vue/useI18n';
import useRouter from '@/hooks/vue/useRouter';
import formatAmount from '@/utils/formatAmount';
import apiMaterials from '@/stores/api/materials';
import ErrorMessage from '@/themes/default/components/ErrorMessage';
import MaterialsFilters from '@/themes/default/components/MaterialsFilters';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Dropdown from '@/themes/default/components/Dropdown';
import MaterialsStore from './_store';
import ReuseEventMaterials from './modals/ReuseEventMaterials';
import Quantity from './components/Quantity';
import {
    normalizeFilters,
    getMaterialsQuantities,
    materialsHasChanged,
} from './_utils';

const noPaginationLimit = 100000;

// @vue/component
const MaterialsListEditor = (props, { root, emit }) => {
    const __ = useI18n();
    const { selected, event } = toRefs(props);
    const { route } = useRouter();
    const dataTableRef = ref(null);
    const filtersRef = ref(null);
    const showSelectedOnly = ref(selected.value.length > 0);
    const manualOrder = ref([]);
    const cancelScanObservation = ref(null);
    const { data: materials, isLoading, error } = useQuery(
        reactive(['materials-while-event', { eventId: event?.value?.id }]),
        () => (
            event?.value?.id
                ? apiMaterials.allWhileEvent(event.value.id)
                : apiMaterials.all({ paginated: false })
        ),
    );

    const hasMaterials = computed(() => (
        (selected.value.length || 0) > 0
    ));

    const columns = ref([
        'child-toggler',
        'qty',
        'reference',
        'name',
        'available_quantity',
        'price',
        'quantity',
        'amount',
        'actions',
    ]);

    const getFilters = (extended = true, isInit = false) => {
        const filters = {};

        if (extended) {
            filters.onlySelected = isInit
                ? selected.value.length
                : showSelectedOnly.value;
        }

        ['park', 'category', 'subCategory'].forEach((key) => {
            if (route.value?.query && key in route.value.query) {
                filters[key] = route.value?.query[key];
            }
        });

        if (route.value?.query?.tags) {
            filters.tags = JSON.parse(route.value.query.tags);
        }

        return normalizeFilters(filters, extended);
    };

    const setSelectedOnly = (onlySelected) => {
        dataTableRef.value?.setCustomFilters({ ...getFilters(), onlySelected });
        dataTableRef.value?.setLimit(
            onlySelected ? noPaginationLimit : config.defaultPaginationLimit,
        );
        showSelectedOnly.value = onlySelected;
    };

    const handleChanges = () => {
        const allMaterials = Object.entries(MaterialsStore.state.materials)
            .map(([id, { quantity }]) => ({
                id: parseInt(id, 10),
                quantity,
            }));

        if (allMaterials.every(({ quantity }) => quantity === 0)) {
            setSelectedOnly(false);
        }

        emit('change', allMaterials);
    };

    const getQuantity = (material) => (
        MaterialsStore.getters.getQuantity(material.id)
    );

    const setQuantity = (material, quantity) => {
        MaterialsStore.commit('setQuantity', { material, quantity });
        handleChanges();
    };

    const tableOptions = ref({
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'reference', ascending: true },
        initialPage: 1,
        perPage: hasMaterials.value ? noPaginationLimit : config.defaultPaginationLimit,
        sortable: ['reference', 'name'],
        columnsClasses: {
            'child-toggler': 'MaterialsListEditor__child-toggler ',
            'qty': 'MaterialsListEditor__qty ',
            'reference': 'MaterialsListEditor__ref ',
            'name': 'MaterialsListEditor__name ',
            'available_quantity': 'MaterialsListEditor__remaining ',
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
            custom: (ascending) => (a, b) => {
                let result = null;

                // - Si on est en mode "sélectionnés uniquement" et qu'au moins l'un
                //   des deux à un ordre manuellement défini, on l'utilise.
                if (showSelectedOnly.value) {
                    const aManualOrderIndex = manualOrder.value?.indexOf(a.id);
                    const bManualOrderIndex = manualOrder.value?.indexOf(b.id);
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
                callback: (row, parkId) => (
                    row.park_id === parkId
                ),
            },
            {
                name: 'category',
                callback: (row, categoryId) => (
                    (row.category_id === null && categoryId === 'uncategorized') ||
                    row.category_id === categoryId
                ),
            },
            {
                name: 'subCategory',
                callback: (row, subCategoryId) => row.sub_category_id === subCategoryId,
            },
            {
                name: 'tags',
                callback: (row, tags) => (
                    tags.length === 0 || row.tags.some((tag) => tags.includes(tag.name))
                ),
            },
            {
                name: 'onlySelected',
                callback: (row, isOnlySelected) => (
                    !isOnlySelected || getQuantity(row) > 0
                ),
            },
        ],
    });

    const handleFiltersChanges = (filters) => {
        const onlySelected = showSelectedOnly.value;
        const newFilters = normalizeFilters({ ...filters, onlySelected });
        dataTableRef.value?.setCustomFilters(newFilters);
    };

    const getAvailableQuantity = (material) => (
        (material.available_quantity || 0) - getQuantity(material)
    );

    onMounted(() => {
        MaterialsStore.commit('init', selected.value);
    });

    onBeforeUnmount(() => {
        if (cancelScanObservation.value) {
            cancelScanObservation.value();
        }
    });

    const handleSelectMany = (materialsToAdd) => {
        const shouldDisplayOnlySelected = !selected.value || selected.value.length === 0;

        materialsToAdd.forEach(({ pivot, ...material }) => {
            const { quantity } = pivot;
            MaterialsStore.commit('setQuantity', { material, quantity });
        });

        handleChanges();

        if (shouldDisplayOnlySelected) {
            setSelectedOnly(true);
        }
    };

    const handleShowReuseEventModal = () => {
        root.$modal.show(
            ReuseEventMaterials,
            undefined,
            { width: 700, draggable: true, clickToClose: true },
            {
                'before-close': ({ params }) => {
                    if (params) {
                        handleSelectMany(params.materials);
                    }
                },
            },
        );
    };

    return () => (
        <div class="MaterialsListEditor">
            <header class="MaterialsListEditor__header">
                <MaterialsFilters ref={filtersRef} onChange={handleFiltersChanges} />
                <div class="MaterialsListEditor__header__extra-filters">
                    {hasMaterials.value && (
                        <div class="MaterialsListEditor__header__extra-filters__filter">
                            {__('display-only-selected-materials')}
                            <SwitchToggle value={showSelectedOnly.value} onInput={setSelectedOnly} />
                        </div>
                    )}
                    <Dropdown variant="actions">
                        <template slot="buttonText">
                            {__('add-materials-from')}
                        </template>
                        <template slot="items">
                            <button type="button" class="Dropdown__item info" onClick={handleShowReuseEventModal}>
                                {__('another-event')}
                            </button>
                        </template>
                    </Dropdown>
                </div>
            </header>
            {error.value && <ErrorMessage error={error.value} />}
            <div class="MaterialsListEditor__main">
                {isLoading.value && (
                    <div class="MaterialsListEditor__loading">
                        <i class="fas fa-circle-notch fa-spin fa-2x" /> {__('loading')}
                    </div>
                )}
                <v-client-table
                    ref={dataTableRef}
                    name="listTemplateMaterialsListTable"
                    data={materials.value || []}
                    columns={columns.value}
                    options={tableOptions.value}
                    scopedSlots={{
                        'qty': ({ row }) => (
                            <span>{getQuantity(row) > 0 ? `${getQuantity(row)}\u00a0×` : ''}</span>
                        ),
                        'available_quantity': ({ row }) => (
                            <span
                                class={{
                                    'MaterialsListEditor__remaining': true,
                                    'MaterialsListEditor__remaining--zero': getAvailableQuantity(row) === 0,
                                    'MaterialsListEditor__remaining--empty': getAvailableQuantity(row) < 0,
                                }}
                            >
                                {__('remaining-count', { count: getAvailableQuantity(row) })}
                            </span>
                        ),
                        'price': ({ row }) => (
                            <Fragment>
                                {formatAmount(row.rental_price)} <i class="fas fa-times" />
                            </Fragment>
                        ),
                        'quantity': ({ row }) => (
                            <Quantity
                                material={row}
                                initialQuantity={getQuantity(row)}
                                onChange={setQuantity}
                            />
                        ),
                        'amount': ({ row }) => (
                            <span>
                                {formatAmount(row.rental_price * getQuantity(row))}
                            </span>
                        ),
                        'actions': ({ row }) => (
                            getQuantity(row) > 0 ? (
                                <button
                                    type="button"
                                    role="button"
                                    class="warning"
                                    onClick={() => { setQuantity(row, 0); }}
                                >
                                    <i class="fas fa-backspace" />
                                </button>
                            ) : null
                        ),
                    }}
                />
                {(!isLoading.value && hasMaterials.value) && (
                    <div class="MaterialsListEditor__add-more">
                        <button
                            type="button"
                            role="button"
                            onClick={() => { setSelectedOnly(!showSelectedOnly.value); }}
                        >
                            {showSelectedOnly.value ? (
                                <Fragment>
                                    <i class="fas fa-plus" />{' '}
                                    {__('display-all-materials-to-add-some')}
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <i class="fas fa-eye" />{' '}
                                    {__('display-only-selected-materials')}
                                </Fragment>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

MaterialsListEditor.props = {
    selected: { type: Array, default: () => [] },
    event: { type: Object, default: undefined },
};

MaterialsListEditor.emits = ['change'];

export {
    getMaterialsQuantities,
    materialsHasChanged,
};

export default MaterialsListEditor;
