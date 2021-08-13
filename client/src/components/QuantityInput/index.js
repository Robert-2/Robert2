import './index.scss';

const QuantityInput = {
    name: 'QuantityInput',
    props: {
        quantity: Number,
        limit: [Number, Object],
    },
    computed: {
        min() {
            if (typeof this.limit !== 'object') {
                return 0;
            }
            return this.limit?.min ?? 0;
        },

        max() {
            if (typeof this.limit !== 'object') {
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

            this.$emit('quantityChange', value);
        },

        handleDecrement() {
            const value = this.quantity - 1;
            if (value < this.min) {
                return;
            }
            this.$emit('quantityChange', value);
        },

        handleIncrement() {
            const value = this.quantity + 1;
            if (this.max != null && value > this.max) {
                return;
            }
            this.$emit('quantityChange', value);
        },
    },
    render() {
        const {
            min,
            max,
            quantity,
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
                    disabled={quantity <= min}
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
                    value={quantity}
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
                        info: max == null || quantity < max,
                    }}
                    disabled={max != null && quantity >= max}
                    onClick={handleIncrement}
                >
                    <i class="fas fa-plus" />
                </button>
            </div>
        );
    },
};

export default QuantityInput;
