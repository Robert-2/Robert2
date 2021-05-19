import './index.scss';

const QuantityInput = {
  name: 'QuantityInput',
  props: {
    quantity: Number,
    limit: Number,
    allowOverflow: { type: Boolean, default: true },
    material: Object,
  },
  methods: {
    setQuantity(event) {
      let newValue = Number.parseInt(event.target.value, 10);
      if (!newValue || Number.isNaN(newValue) || newValue <= 0) {
        newValue = 0;
      } else if (newValue >= this.limit && !this.allowOverflow) {
        newValue = this.limit;
      }

      this.$emit('quantityChange', this.material, newValue);
    },

    decrement() {
      if (this.quantity <= 0) {
        return;
      }

      const newValue = this.quantity - 1;
      this.$emit('quantityChange', this.material, newValue);
    },

    increment() {
      if (this.quantity >= this.limit && !this.allowOverflow) {
        return;
      }

      const newValue = this.quantity + 1;
      this.$emit('quantityChange', this.material, newValue);
    },
  },
  render() {
    const {
      quantity,
      limit,
      allowOverflow,
      decrement,
      setQuantity,
      increment,
    } = this;

    return (
      <div class="QuantityInput">
        <button
          type="button"
          role="button"
          class="QuantityInput__button"
          disabled={quantity === 0}
          onClick={decrement}
        >
          <i class="fas fa-minus" />
        </button>
        <input
          type="number"
          class="QuantityInput__input"
          step={1}
          min={0}
          max={limit}
          value={quantity}
          onInput={setQuantity}
          onFocus={(event) => { event.target.select(); }}
        />
        <button
          type="button"
          role="button"
          class={{
            QuantityInput__button: true,
            info: quantity < limit,
          }}
          disabled={quantity >= limit && !allowOverflow}
          onClick={increment}
        >
          <i class="fas fa-plus" />
        </button>
      </div>
    );
  },
};

export default QuantityInput;
