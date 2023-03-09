import debounce from 'debounce';
import { toRefs, ref, watch } from '@vue/composition-api';
import QuantityInput from '@/themes/default/components/QuantityInput';

import type { Component, SetupContext } from '@vue/composition-api';
import type { Material } from '@/stores/api/materials';

type Props = {
    material: Material,
    initialQuantity: number,
};

type Events = {
    onChange(material: Material, newQuantity: number): void,
};

// @vue/component
const MaterialsListEditorQuantity: Component<Props & Events> = (props: Props, { emit }: SetupContext) => {
    const { material, initialQuantity } = toRefs(props as Required<Props>);

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
