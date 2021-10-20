import './index.scss';
import { toRefs, ref, computed, onMounted, onBeforeUnmount, reactive } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import { Fragment } from 'vue-fragment';
import config from '@/globals/config';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import formatAmount from '@/utils/formatAmount';
import observeBarcodeScan from '@/utils/observeBarcodeScan';
import apiMaterials from '@/stores/api/materials';
import ErrorMessage from '@/components/ErrorMessage';
import MaterialsFilters from '@/components/MaterialsFilters';
import SwitchToggle from '@/components/SwitchToggle';
import MaterialsStore from './_store';
import { normalizeFilters } from './_utils';
import Quantity from './Quantity';
import Units from './Units';
import ListTemplateUsage from './ListTemplateUsage';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ClientTableInstance, ClientTableOptions, TableRow } from 'vue-tables-2';
import type { Material, MaterialUnit, MaterialWithPivot } from '@/stores/api/materials';
import type { Event } from '@/stores/api/events';
import type { Tag } from '@/stores/api/tags';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';
import type { MaterialQuantity, RawFilters, MaterialsFiltersType } from './_utils';

type Props = {
    selected?: MaterialWithPivot[],
    event?: Event,
    withTemplates?: boolean,
    onChange(newList: MaterialQuantity[]): void,
};

const noPaginationLimit = 100000;

// @vue/component
const MaterialsListEditor = (props: Props, { root, emit }: SetupContext): Render => {
    const __ = useI18n();
    const { selected, event, withTemplates } = toRefs(props);

    const { route } = useRouter();

    const dataTableRef = ref<ClientTableInstance | null>(null);
    const filtersRef = ref<typeof MaterialsFilters | null>(null);
    const showSelectedOnly = ref<boolean>(selected!.value!.length > 0);
    const manualOrder = ref<number[]>([]);
    const cancelScanObservation = ref<(() => void) | null>(null);

    const { data: materials, isLoading, error } = useQuery<Material[]>(
        reactive(['materials-while-event', { eventId: event?.value?.id }]),
        () => (
            event?.value?.id
                ? apiMaterials.allWhileEvent(event.value.id)
                : apiMaterials.allWithoutPagination()
        ),
    );

    const hasMaterials = computed<boolean>(() => (
        (selected!.value!.length || 0) > 0
    ));

    const columns = ref<string[]>([
        'child-toggler',
        'qty',
        'reference',
        'name',
        'remaining_quantity',
        'price',
        'quantity',
        'amount',
        'actions',
    ]);

    const getFilters = (extended: boolean = true, isInit: boolean = false): MaterialsFiltersType => {
        const filters: Record<string, number | boolean | string> = {};

        if (extended) {
            filters.onlySelected = isInit
                ? selected!.value!.length
                : showSelectedOnly.value;
        }

        ['park', 'category', 'subCategory'].forEach((key: string) => {
            if (route.value?.query && key in route.value.query) {
                filters[key] = route.value?.query[key] as string;
            }
        });

        if (route.value?.query?.tags) {
            filters.tags = JSON.parse(route.value.query.tags as string);
        }

        return normalizeFilters(filters, extended);
    };

    const setSelectedOnly = (onlySelected: boolean): void => {
        dataTableRef.value?.setCustomFilters({ ...getFilters(), onlySelected });
        dataTableRef.value?.setLimit(
            onlySelected ? noPaginationLimit : config.defaultPaginationLimit,
        );
        showSelectedOnly.value = onlySelected;
    };

    const handleChanges = (): void => {
        const allMaterials: MaterialQuantity[] = Object.entries(MaterialsStore.state.materials)
            // - Laissons Typescript inférer le type de l'argument du map ici...
            // eslint-disable-next-line @typescript-eslint/typedef
            .map(([id, { quantity, units }]) => ({
                id: parseInt(id, 10),
                quantity,
                units: [...units],
            }));

        if (allMaterials.every(({ quantity }: MaterialQuantity) => quantity === 0)) {
            setSelectedOnly(false);
        }

        emit('change', allMaterials);
    };

    const getQuantity = (material: Material): number => (
        MaterialsStore.getters.getQuantity(material.id)
    );

    const setQuantity = (material: Material, quantity: number): void => {
        MaterialsStore.commit('setQuantity', { material, quantity });
        handleChanges();
    };

    const tableOptions = ref<ClientTableOptions<Material, MaterialsFiltersType>>({
        columnsDropdown: false,
        preserveState: false,
        orderBy: { column: 'reference', ascending: true },
        initialPage: 1,
        perPage: hasMaterials.value ? noPaginationLimit : config.defaultPaginationLimit,
        sortable: ['reference', 'name'],
        columnsClasses: {
            'child-toggler': 'MaterialsListEditor__child-toggler',
            'qty': 'MaterialsListEditor__qty',
            'reference': 'MaterialsListEditor__ref',
            'name': 'MaterialsListEditor__name',
            'remaining_quantity': 'MaterialsListEditor__remaining',
            'price': 'MaterialsListEditor__price',
            'quantity': 'MaterialsListEditor__quantity',
            'amount': 'MaterialsListEditor__amount',
            'actions': 'MaterialsListEditor__actions',
        },
        initFilters: getFilters(true, true),
        headings: {
            'child-toggler': '',
            'qty': __('qty'),
            'reference': __('reference'),
            'name': __('name'),
            'stock_quantity': __('quantity'),
            'quantity': '',
            'actions': '',
        },
        customSorting: {
            custom: (ascending: boolean) => (a: Material, b: Material) => {
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
                callback: (row: Material, parkId: number) => {
                    if (!row.is_unitary) {
                        return row.park_id === parkId;
                    }
                    return row.units.some((unit: MaterialUnit) => unit.park_id === parkId);
                },
            },
            {
                name: 'category',
                callback: (row: Material, categoryId: number) => row.category_id === categoryId,
            },
            {
                name: 'subCategory',
                callback: (row: Material, subCategoryId: number) => row.sub_category_id === subCategoryId,
            },
            {
                name: 'tags',
                callback: (row: Material, tags: string[]) => (
                    tags.length === 0 || row.tags.some((tag: Tag) => tags.includes(tag.name))
                ),
            },
            {
                name: 'onlySelected',
                callback: (row: Material, isOnlySelected: boolean) => (
                    !isOnlySelected || getQuantity(row) > 0
                ),
            },
        ],
    });

    const isFiltered = computed(() => (
        Object.keys(getFilters(false)).length !== 0
    ));

    const handleFiltersChanges = (filters: RawFilters): void => {
        const onlySelected = showSelectedOnly.value;
        const newFilters = normalizeFilters({ ...filters, onlySelected });
        dataTableRef.value?.setCustomFilters(newFilters);
    };

    const getRemainingQuantity = (material: Material): number => {
        if (!material.is_unitary) {
            return (material.remaining_quantity || 0) - getQuantity(material);
        }

        const filters = getFilters();
        const selectedUnits = MaterialsStore.getters.getUnits(material.id);
        const availableUnits = material.units.filter((unit: MaterialUnit) => {
            if (!unit.is_available || unit.is_broken) {
                return false;
            }

            return !(
                filters.park &&
                unit.park_id !== filters.park &&
                !selectedUnits.includes(unit.id)
            );
        });

        return availableUnits.length - selectedUnits.length;
    };

    const isChildOpen = (id: number): boolean => {
        const tableRef = dataTableRef.value?.$refs.table;
        return tableRef?.openChildRows.includes(id) || false;
    };

    const toggleChild = (id: number): void => {
        dataTableRef.value?.toggleChildRow(id);
    };

    const selectUnit = (material: Material, unitId: number): boolean => {
        const selectedUnits = MaterialsStore.getters.getUnits(material.id);
        const isAlreadySelected = selectedUnits.includes(unitId);
        if (isAlreadySelected) {
            return false;
        }

        const materialFromList = materials.value?.find(({ id }: Material) => id === material.id);
        if (!materialFromList) {
            return false;
        }

        const unit = materialFromList.units?.find(({ id }: MaterialUnit) => id === unitId);
        if (!unit || !unit.is_available || unit.is_broken) {
            MaterialsStore.commit('increment', materialFromList);
            return true;
        }

        MaterialsStore.commit('selectUnit', { material: materialFromList, unitId });
        return true;
    };

    const handleScan = (id: number, unitId: number): void => {
        if (!id || !unitId) {
            return;
        }

        const material = materials.value?.find((_material: Material) => _material.id === id);
        if (!material || !material.is_unitary) {
            return;
        }

        const unit = material.units.find((_unit: MaterialUnit) => _unit.id === unitId);
        if (!unit || !unit.is_available) {
            return;
        }

        // - On affiche uniquement les items sélectionnés.
        setSelectedOnly(true);

        // - On reset les filtres (au cas ou l'item scanné n'est pas dedans).
        if (isFiltered.value) {
            filtersRef.value?.clearFilters();
        }

        // - On sélectionne l'unité (si elle n'est pas encore sélectionnée).
        if (selectUnit(material, unit.id)) {
            handleChanges();
        }

        // - Ajoute l'élément au tableau des ordonnés "manuellement".
        const existingOrderIndex = manualOrder.value.indexOf(material.id);
        if (existingOrderIndex !== -1) {
            manualOrder.value.splice(existingOrderIndex, 1);
        }
        manualOrder.value.push(material.id);

        // TODO: Améliorer ça, pas idéal d'avoir à référencer le `.content` ici ...
        document.querySelector('.content')?.scrollTo(0, 0);
    };

    onMounted(() => {
        MaterialsStore.commit('init', selected!.value);

        cancelScanObservation.value = observeBarcodeScan(handleScan);
    });

    onBeforeUnmount(() => {
        if (cancelScanObservation.value) {
            cancelScanObservation.value();
        }
    });

    const hanleSelectTemplate = ({ materials: templateMaterials }: ListTemplateWithMaterial): void => {
        templateMaterials.forEach(({ pivot, ...material }: MaterialWithPivot) => {
            const { quantity, units } = pivot;
            if (material.is_unitary) {
                units.forEach((unitId: number) => {
                    selectUnit(material, unitId);
                });
            } else {
                MaterialsStore.commit('setQuantity', { material, quantity });
            }
        });

        handleChanges();
    };

    const showTemplateUsageModal = (): void => {
        root.$modal.show(
            ListTemplateUsage,
            undefined,
            { width: 700, draggable: true, clickToClose: true },
            {
                'before-close': ({ params }: { params?: { template: ListTemplateWithMaterial } }) => {
                    if (params) {
                        hanleSelectTemplate(params.template);
                    }
                },
            },
        );
    };

    return () => (
        <div class="MaterialsListEditor">
            <header class="MaterialsListEditor__header">
                <MaterialsFilters
                    ref={filtersRef}
                    onChange={handleFiltersChanges}
                />
                <div class="MaterialsListEditor__header__extra-filters">
                    {hasMaterials.value && (
                        <div class="MaterialsListEditor__header__extra-filters__filter">
                            {__('display-only-selected-materials')}
                            <SwitchToggle value={showSelectedOnly.value} onInput={setSelectedOnly} />
                        </div>
                    )}
                    {withTemplates!.value && (
                        <button type="button" class="info" onClick={showTemplateUsageModal}>
                            {__('use-list-template')}
                        </button>
                    )}
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
                        'child-toggler': ({ row }: TableRow<Material>) => (
                            row.is_unitary ? (
                                <button
                                    type="button"
                                    class="MaterialsListEditor__child-toggler__button"
                                    onClick={() => { toggleChild(row.id); }}
                                >
                                    <i
                                        class={{
                                            'fas': true,
                                            'fa-caret-right': !isChildOpen(row.id),
                                            'fa-caret-down': isChildOpen(row.id),
                                        }}
                                    />
                                </button>
                            ) : null
                        ),
                        'child_row': ({ row }: TableRow<Material>) => (
                            <Units
                                material={row}
                                initialData={selected!.value}
                                filters={getFilters()}
                                onChange={handleChanges}
                            />
                        ),
                        'qty': ({ row }: TableRow<Material>) => (
                            <span>{getQuantity(row) > 0 ? `${getQuantity(row)}\u00a0×` : ''}</span>
                        ),
                        'remaining_quantity': ({ row }: TableRow<Material>) => (
                            <span
                                class={{
                                    'MaterialsListEditor__remaining': true,
                                    'MaterialsListEditor__remaining--zero': getRemainingQuantity(row) === 0,
                                    'MaterialsListEditor__remaining--empty': getRemainingQuantity(row) < 0,
                                }}
                            >
                                {__('remaining-count', { count: getRemainingQuantity(row) })}
                            </span>
                        ),
                        'price': ({ row }: TableRow<Material>) => (
                            <Fragment>
                                {formatAmount(row.rental_price)} <i class="fas fa-times" />
                            </Fragment>
                        ),
                        'quantity': ({ row }: TableRow<Material>) => (
                            <Quantity
                                material={row}
                                initialQuantity={getQuantity(row)}
                                onChange={setQuantity}
                            />
                        ),
                        'amount': ({ row }: TableRow<Material>) => (
                            <span>
                                {formatAmount(row.rental_price * getQuantity(row))}
                            </span>
                        ),
                        'actions': ({ row }: TableRow<Material>) => (
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
    withTemplates: { type: Boolean, default: false },
};

MaterialsListEditor.emits = ['change'];

export default MaterialsListEditor;
