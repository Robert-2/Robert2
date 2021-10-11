import './index.scss';
import { computed, toRefs, ref, watch } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import MaterialsStore from '../_store';
import Unit from './Unit';

import type { Render, SetupContext } from '@vue/composition-api';
import type { Material, MaterialUnit, MaterialWithPivot } from '@/stores/api/materials';
import type { MaterialsFiltersType } from '../_utils';

type Props = {
    material: Material,
    initialData: MaterialWithPivot[] | undefined,
    filters: MaterialsFiltersType,
    onChange(): void,
};

// @vue/component
const MaterialsListEditorUnits = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { material, initialData, filters } = toRefs(props);

    const initialMaterial = initialData.value?.find(({ id }: MaterialWithPivot) => id === material.value.id);
    const initialUnits = ref<number[]>(initialMaterial ? [...initialMaterial.pivot.units] : []);
    const withUnavailable = ref<boolean>(false);

    const selected = computed(() => MaterialsStore.getters.getUnits(material.value.id));
    const units = computed(() => material.value.units.filter((unit: MaterialUnit) => {
        if (initialUnits.value.includes(unit.id)) {
            return true;
        }

        if (filters.value.park && unit.park_id !== filters.value.park) {
            return false;
        }

        return withUnavailable.value || (unit.is_available && !unit.is_broken);
    }));

    const handleToggleUnit = (id: number): void => {
        MaterialsStore.commit('toggleUnit', { material: material.value, unitId: id });
        emit('change');
    };

    const toggleWithUnavailable = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        withUnavailable.value = !withUnavailable.value;
    };

    watch(initialData, (newInitialData: MaterialWithPivot[] | undefined) => {
        const newMaterial = newInitialData?.find(({ id }: MaterialWithPivot) => (
            id === material.value.id
        ));
        if (!newMaterial) {
            return;
        }

        const newUnits = [...newMaterial.pivot.units]
            .filter((unitId: number) => !initialUnits.value.includes(unitId));

        initialUnits.value.push(...newUnits);
    });

    return () => {
        if (units.value.length === 0) {
            return (
                <div class="MaterialsListEditorUnits">
                    <p class="MaterialsListEditorUnits__empty">
                        {__('page-events.no-units-available')}
                    </p>
                </div>
            );
        }

        return (
            <div class="MaterialsListEditorUnits">
                <div class="MaterialsListEditorUnits__tables">
                    <table class="MaterialsListEditorUnits__table MaterialsListEditorUnits__table--header">
                        <thead>
                            <tr>
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--selector" />
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--reference">
                                    {__('reference')}
                                </th>
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--is-broken">
                                    {__('is-broken')}
                                    <button
                                        type="button"
                                        class="MaterialsListEditorUnits__mini-action-button"
                                        onClick={toggleWithUnavailable}
                                    >
                                        {withUnavailable.value ? <i class="fas fa-eye-slash" /> : <i class="fas fa-eye" />}
                                    </button>
                                </th>
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--is-lost">
                                    {__('is-lost')}
                                    <button
                                        type="button"
                                        class="MaterialsListEditorUnits__mini-action-button"
                                        onClick={toggleWithUnavailable}
                                    >
                                        {withUnavailable.value ? <i class="fas fa-eye-slash" /> : <i class="fas fa-eye" />}
                                    </button>
                                </th>
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--state">
                                    {__('state')}
                                </th>
                                <th class="MaterialsListEditorUnits__heading MaterialsListEditorUnits__heading--park">
                                    {__('park')}
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div class="MaterialsListEditorUnits__body">
                        <table class="MaterialsListEditorUnits__table MaterialsListEditorUnits__table--body">
                            <tbody>
                                {units.value.map((unit: MaterialUnit) => (
                                    <Unit
                                        key={unit.id}
                                        data={unit}
                                        isSelected={selected.value.includes(unit.id)}
                                        onToggle={() => { handleToggleUnit(unit.id); }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
};

MaterialsListEditorUnits.props = {
    material: { type: Object, required: true },
    initialData: { type: Array, required: true },
    filters: { type: Object, required: true },
};

MaterialsListEditorUnits.emits = ['change'];

export default MaterialsListEditorUnits;
