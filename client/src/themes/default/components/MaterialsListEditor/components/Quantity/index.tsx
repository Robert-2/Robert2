import { defineComponent } from '@vue/composition-api';
import debounce from 'lodash/debounce';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import QuantityInput from '@/themes/default/components/QuantityInput';

import type { PropType } from '@vue/composition-api';
import type { MaterialWithAvailabilities } from '@/stores/api/materials';

type Props = {
    /** Le matériel dont on veut définir les quantités. */
    material: MaterialWithAvailabilities,

    /** La quantité initiale à appliquer. */
    initialQuantity: number,
};

type Data = {
    quantity: number,
};

// @vue/component
const MaterialsListEditorQuantity = defineComponent({
    name: 'MaterialsListEditorQuantity',
    props: {
        material: {
            type: Object as PropType<Required<Props['material']>>,
            required: true,
        },
        initialQuantity: {
            type: Number as PropType<Required<Props['initialQuantity']>>,
            required: true,
        },
    },
    data(): Data {
        return {
            quantity: this.initialQuantity,
        };
    },
    watch: {
        initialQuantity(newValue: number) {
            this.quantity = newValue;
        },
    },
    created() {
        this.updateQuantityDebounced = debounce(this.updateQuantity.bind(this), DEBOUNCE_WAIT);
    },
    beforeUnmount() {
        this.updateQuantityDebounced.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(value: string) {
            this.quantity = parseInt(value, 10) || 0;
            this.updateQuantityDebounced();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        updateQuantity() {
            const { material, quantity } = this;
            this.$emit('change', material, quantity);
        },
    },
    render() {
        const { quantity, handleChange } = this;

        return (
            <QuantityInput value={quantity} onChange={handleChange} />
        );
    },
});

export default MaterialsListEditorQuantity;
