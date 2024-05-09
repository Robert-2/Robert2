import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

// @vue/component
export default defineComponent({
    name: 'QuantityInput',
    props: {
        value: { type: Number, required: true },
        limit: { type: [Number, Object], default: null },
    },
    emits: ['change'],
    computed: {
        min() {
            if (typeof this.limit !== 'object') {
                return 0;
            }
            return this.limit?.min ?? 0;
        },

        max() {
            if (typeof this.limit !== 'object' || this.limit === null) {
                return this.limit;
            }
            return this.limit?.max;
        },
    },
    methods: {
        handleInputChange(event) {
            let value = Number.parseInt(event.target.value, 10);

            if ((!value && value !== 0) || Number.isNaN(value) || !Number.isFinite(value)) {
                value = this.min;
            }

            if (value < this.min) {
                value = this.min;
            }

            if (![undefined, null].includes(this.max) && value > this.limit) {
                value = this.max;
            }

            this.$emit('change', value);
        },

        handleDecrement() {
            const value = this.value - 1;
            if (value < this.min) {
                return;
            }
            this.$emit('change', value);
        },

        handleIncrement() {
            const value = this.value + 1;
            if (![undefined, null].includes(this.max) && value > this.max) {
                return;
            }
            this.$emit('change', value);
        },
    },
    render() {
        const {
            min,
            max,
            value,
            handleDecrement,
            handleIncrement,
            handleInputChange,
        } = this;

        return (
            <div class="QuantityInput">
                <button
                    type="button"
                    role="button"
                    class={[
                        'QuantityInput__button',
                        'QuantityInput__button--decrement',
                        { 'QuantityInput__button--disabled': value <= min },
                    ]}
                    disabled={value <= min}
                    onClick={handleDecrement}
                >
                    <Icon name="minus" />
                </button>
                <input
                    type="number"
                    class="QuantityInput__input"
                    step={1}
                    min={min}
                    max={max}
                    value={value}
                    onInput={handleInputChange}
                    onFocus={(event) => {
                        event.target.select();
                    }}
                />
                <button
                    type="button"
                    role="button"
                    class={[
                        'QuantityInput__button',
                        'QuantityInput__button--increment',
                        { 'QuantityInput__button--disabled': ![undefined, null].includes(max) && value >= max },
                    ]}
                    disabled={![undefined, null].includes(max) && value >= max}
                    onClick={handleIncrement}
                >
                    <Icon name="plus" />
                </button>
            </div>
        );
    },
});
