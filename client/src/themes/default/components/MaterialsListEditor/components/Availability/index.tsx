import './index.scss';
import { defineComponent } from '@vue/composition-api';
import MaterialsStore from '../../_store';

import type { PropType } from '@vue/composition-api';
import type {
    MaterialWithAvailabilities,
} from '@/stores/api/materials';
import type { MaterialsFiltersType } from '../../_utils';

type Props = {
    /** Le matériel avec ses quantités disponibles. */
    material: MaterialWithAvailabilities,

    /** Les filtres utilisés, pour en tenir compte dans les quantités affichées. */
    filters: MaterialsFiltersType,
};

const MaterialsListEditorAvailability = defineComponent({
    name: 'MaterialsListEditorAvailability',
    props: {
        material: {
            type: Object as PropType<Required<Props>['material']>,
            required: true,
        },
        filters: {
            type: Object as PropType<Required<Props>['filters']>,
            required: true,
        },
    },
    computed: {
        availability() {
            const { material } = this;
            const quantityUsed = MaterialsStore.getters.getQuantity(material.id);

            const availableQuantity = (material.available_quantity || 0) - quantityUsed;
            return {
                stock: Math.max(availableQuantity, 0),
                surplus: Math.abs(Math.min(0, availableQuantity)),
            };
        },
    },
    render() {
        const { $t: __, availability } = this;
        const classNames = ['MaterialsListEditorAvailability', {
            'MaterialsListEditorAvailability--warning': availability.stock === 0,
        }];

        return (
            <div class={classNames}>
                <span class="MaterialsListEditorAvailability__stock">
                    {__('stock-count', { count: availability.stock }, availability.stock)}
                </span>
                {availability.surplus > 0 && (
                    <span class="MaterialsListEditorAvailability__surplus">
                        ({__('surplus-count', { count: availability.surplus }, availability.surplus)})
                    </span>
                )}
            </div>
        );
    },
});

export default MaterialsListEditorAvailability;
