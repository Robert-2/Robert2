import debounce from 'debounce';
import { toRefs, ref, watch } from '@vue/composition-api';
import QuantityInput from '@/components/QuantityInput';

// @vue/component
const MaterialsListEditorQuantity = (props, { emit }) => {
    const { material, initialQuantity } = toRefs(props);

    const quantity = ref(initialQuantity.value);

    const updateQuantityDebounced = debounce(() => {
        emit('change', material.value, quantity.value);
    }, 400);

    const handleChange = (value) => {
        quantity.value = parseInt(value, 10) || 0;
        updateQuantityDebounced();
    };

    watch(initialQuantity, (newValue) => {
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
