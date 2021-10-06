import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import useI18n from '@/hooks/useI18n';
import apiParks from '@/stores/api/parks';
import apiUnitStates from '@/stores/api/unit-states';

import type { Render, SetupContext } from '@vue/composition-api';
import type { PaginatedData } from '@/globals/types/pagination';
import type { Park } from '@/stores/api/parks';
import type { UnitState } from '@/stores/api/unit-states';
import type { MaterialUnit } from '@/stores/api/materials';

type Props = {
    key: number,
    data: MaterialUnit,
    isSelected: boolean,
    onToggle(): void,
};

// @vue/component
const MaterialsListEditorUnit = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { data, isSelected } = toRefs(props);

    const { data: parks } = useQuery<PaginatedData<Park[]>>('parks', apiParks.all);
    const { data: unitStates } = useQuery<UnitState[]>('unit-states', apiUnitStates.all);

    const parkName = computed(() => {
        if (!parks.value) {
            return null;
        }
        const park = parks.value.data.find(({ id }: Park) => id === data.value.park_id);
        return park ? park.name : null;
    });

    const unitStateName = computed(() => {
        const { state } = data.value;
        const unitState = unitStates.value?.find(({ id }: UnitState) => id === state);
        return unitState?.name || null;
    });

    const isAvailable = computed(() => !!data.value.is_available);

    const classNames = computed(() => {
        const classNames = ['MaterialsListEditorUnit'];

        if (isSelected.value) {
            classNames.push('MaterialsListEditorUnit--selected');
        }

        if (!isAvailable.value) {
            classNames.push('MaterialsListEditorUnit--unavailable');
        }

        if (data.value.is_broken) {
            classNames.push('MaterialsListEditorUnit--broken');
        }

        if (data.value.is_lost) {
            classNames.push('MaterialsListEditorUnit--lost');
        }

        return classNames.join(' ');
    });

    const handleToggle = () => {
        if (!isAvailable.value && !isSelected.value) {
            return;
        }
        emit('toggle');
    };

    const handleCheckbox = (e: Event) => {
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
