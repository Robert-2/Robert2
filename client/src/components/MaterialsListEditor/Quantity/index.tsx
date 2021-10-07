import debounce from 'debounce';
import { toRefs, ref, watch } from '@vue/composition-api';
import QuantityInput from '@/components/QuantityInput';

import type { Render, SetupContext } from '@vue/composition-api';
import type { MaterialWhileEvent } from '@/stores/api/materials';

type Props = {
    material: MaterialWhileEvent,
    initialQuantity: number,
    onChange(material: MaterialWhileEvent, newQuantity: number): void,
};

// @vue/component
const MaterialsListEditorQuantity = (props: Props, { emit }: SetupContext): Render => {
    const { material, initialQuantity } = toRefs(props);

    const quantity = ref<number>(initialQuantity.value);

    const updateQuantityDebounced = debounce(() => {
        emit('change', material.value, quantity.value);
    }, 400);

    const handleChange = (value: string): void => {
        quantity.value = parseInt(value, 10) || 0;
        updateQuantityDebounced();
    };

    watch(initialQuantity, (newValue: number) => {
        quantity.value = newValue;
    });

    return () => (
        <QuantityInput value={quantity.value} onChange={handleChange} />
    );
};

MaterialsListEditorQuantity.props = {
    material: { type: Object, required: true },
    initialQuantity: { type: Number, default: 0 },
};

MaterialsListEditorQuantity.emits = ['change'];

export default MaterialsListEditorQuantity;
