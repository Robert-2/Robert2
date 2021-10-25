import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import useI18n from '@/hooks/useI18n';
import apiParks from '@/stores/api/parks';
import apiUnitStates from '@/stores/api/unit-states';

import type { Component, SetupContext } from '@vue/composition-api';
import type { Park } from '@/stores/api/parks';
import type { UnitState } from '@/stores/api/unit-states';
import type { MaterialUnit } from '@/stores/api/materials';

type Props = {
    data: MaterialUnit,
    isSelected: boolean,
    onToggle(): void,
};

// @vue/component
const MaterialsListEditorUnit: Component<Props> = (props: Props, { emit }: SetupContext) => {
    const __ = useI18n();
    const { data, isSelected } = toRefs(props);

    const { data: parks } = useQuery<Park[]>('parks', apiParks.list);
    const { data: unitStates } = useQuery<UnitState[]>('unit-states', apiUnitStates.all);

    const parkName = computed(() => (
        parks?.value?.find((park: Park) => park.id === data.value.park_id)?.name || ''
    ));

    const unitStateName = computed(() => {
        const { state } = data.value;
        const unitState = unitStates.value?.find(({ id }: UnitState) => id === state);
        return unitState?.name || null;
    });

    const isAvailable = computed(() => !!data.value.is_available);

    const classNames = computed(() => {
        const classesList = ['MaterialsListEditorUnit'];

        if (isSelected.value) {
            classesList.push('MaterialsListEditorUnit--selected');
        }

        if (!isAvailable.value) {
            classesList.push('MaterialsListEditorUnit--unavailable');
        }

        if (data.value.is_broken) {
            classesList.push('MaterialsListEditorUnit--broken');
        }

        if (data.value.is_lost) {
            classesList.push('MaterialsListEditorUnit--lost');
        }

        return classesList.join(' ');
    });

    const handleToggle = (): void => {
        if (!isAvailable.value && !isSelected.value) {
            return;
        }
        emit('toggle');
    };

    const handleCheckbox = (e: Event): void => {
        e.preventDefault();
        if (!e.currentTarget) {
            return;
        }
        (e.currentTarget as HTMLInputElement).checked = isSelected.value;
    };

    return () => (
        <tr class={classNames.value} onClick={handleToggle}>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--selector">
                <input
                    type="checkbox"
                    disabled={!isAvailable.value && !isSelected.value}
                    checked={isSelected.value}
                    onInput={handleCheckbox}
                />
            </td>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--reference">
                {data.value.reference}
            </td>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--is-broken">
                {data.value.is_broken ? __('yes') : __('no')}
            </td>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--is-lost">
                {data.value.is_lost ? __('yes') : __('no')}
            </td>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--state">
                {unitStateName.value}
            </td>
            <td class="MaterialsListEditorUnit__col MaterialsListEditorUnit__col--park">
                {parkName.value}
            </td>
        </tr>
    );
};

MaterialsListEditorUnit.props = {
    data: { type: Object, required: true },
    isSelected: { type: Boolean, required: true },
};

MaterialsListEditorUnit.emits = ['toggle'];

export default MaterialsListEditorUnit;
