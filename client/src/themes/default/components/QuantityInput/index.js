import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
export default defineComponent({
    name: 'QuantityInput',
    props: {
        value: { type: Number, required: true },
        limit: { type: [Number, Object], default: null },
    },
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

            if (this.max != null && value > this.limit) {
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
            if (this.max != null && value > this.max) {
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
                    class="QuantityInput__button"
                    disabled={value <= min}
                    onClick={handleDecrement}
                >
                    <i class="fas fa-minus" />
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
                    class={{
                        QuantityInput__button: true,
                        info: max == null || value < max,
                    }}
                    disabled={max != null && value >= max}
                    onClick={handleIncrement}
                >
                    <i class="fas fa-plus" />
                </button>
            </div>
        );
    },
});
