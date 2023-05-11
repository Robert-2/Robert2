import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';
import type { MaterialWithAvailabilities } from '@/stores/api/materials';
import type { Park } from '@/stores/api/parks';

type Props = {
    material: MaterialWithAvailabilities,
    parkFilter?: Park['id'] | null,
};

// @vue/component
const MaterialsQuantities = defineComponent({
    name: 'MaterialsQuantities',
    props: {
        material: {
            type: Object as PropType<Required<Props>['material']>,
            required: true,
        },
        parkFilter: {
            type: Number as PropType<Required<Props>['parkFilter']>,
            default: null,
        },
    },
    computed: {
        stockQuantity() {
            const { material } = this;
            return material.stock_quantity;
        },

        availableQuantity() {
            const { material } = this;
            return material.available_quantity;
        },

        isCurrentlyUsed() {
            const { stockQuantity, availableQuantity } = this;
            return stockQuantity !== availableQuantity;
        },
    },
    render() {
        const { $t: __, stockQuantity, availableQuantity, isCurrentlyUsed } = this;

        const classNames = ['MaterialsQuantities', {
            'MaterialsQuantities--used': isCurrentlyUsed,
            'MaterialsQuantities--exhausted': availableQuantity === 0,
        }];

        return (
            <div class={classNames}>
                <span class="MaterialsQuantities__available">
                    {__('page.materials.available', { availableQuantity }, availableQuantity)}
                </span>
                &nbsp;/&nbsp;
                <span class="MaterialsQuantities__stock">
                    {stockQuantity}
                </span>
            </div>
        );
    },
});

export default MaterialsQuantities;
