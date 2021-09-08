import debounce from 'debounce';
import QuantityInput from '@/components/QuantityInput';

// @vue/component
export default {
    name: 'MaterialsListQuantity',
    props: {
        material: { type: Object, required: true },
        initialQuantity: { type: Number, default: 0 },
    },
    data() {
        return {
            quantity: this.initialQuantity,
        };
    },
    methods: {
        handleChange(newQuantity) {
            this.quantity = newQuantity;
            this.updateQuantityDebounced();
        },

        // - On a besoin du 'this', donc obligé d'utiliser une fonction non fléchée
        // eslint-disable-next-line func-names
        updateQuantityDebounced: debounce(function () {
            this.$emit('change', this.material, this.quantity);
        }, 400),
    },
    render() {
        const { quantity, handleChange } = this;
        return <QuantityInput value={quantity} onChange={handleChange} />;
    },
};
