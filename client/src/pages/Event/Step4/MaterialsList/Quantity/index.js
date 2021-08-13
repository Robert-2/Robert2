import debounce from 'debounce';
import QuantityInput from '@/components/QuantityInput';

export default {
    name: 'MaterialsListQuantity',
    props: {
        material: Object,
        initialQuantity: Number,
    },
    data() {
        return {
            quantity: this.initialQuantity,
        };
    },
    methods: {
        setQuantity(newValue) {
            this.quantity = newValue;
            this.updateQuantityDebounced();
        },

        // eslint-disable-next-line func-names
        updateQuantityDebounced: debounce(function () {
            this.$emit('setQuantity', this.material, this.quantity);
        }, 400),
    },
    render() {
        const { material, quantity, setQuantity } = this;

        return (
      <QuantityInput
        material={material}
        quantity={quantity}
        onQuantityChange={setQuantity}
        allowOverflow
      />
        );
    },
};
