import './index.scss';
import { defineComponent } from '@vue/composition-api';
import QuantityInput from '@/themes/default/components/QuantityInput';

// @vue/component
const InventoryItemMaterial = defineComponent({
    name: 'InventoryItemMaterial',
    props: {
        material: { type: Object, required: true },
        quantities: { type: Object, required: true },
        locked: { type: Boolean, default: false },
        strict: { type: Boolean, default: false },
        error: { type: Object, default: undefined },
    },
    computed: {
        id() {
            return this.material.id;
        },

        //
        // - Awaited
        //

        awaitedQuantity() {
            const awaitedQuantity = this.material.awaited_quantity ?? 0;
            if (this.locked) {
                return awaitedQuantity;
            }

            return awaitedQuantity;
        },

        awaitedExternalQuantity() {
            return this.awaitedQuantity;
        },

        //
        // - Actual
        //

        actualQuantity() {
            const actualQuantity = this.quantities?.actual ?? 0;

            if (this.locked) {
                return actualQuantity;
            }

            if (actualQuantity < 0) {
                this.quantityWarning('La quantité présente est inférieure à zéro.');
                return 0;
            }

            if (this.strict && actualQuantity > this.awaitedQuantity) {
                this.quantityWarning('La quantité présente totale est supérieure à la quantité totale attendue en mode strict.');
                return this.awaitedQuantity;
            }

            return actualQuantity;
        },

        currentlyAwaitedActualQuantity() {
            return this.awaitedQuantity;
        },

        //
        // - Broken
        //

        brokenQuantity() {
            const brokenQuantity = this.quantities?.broken ?? 0;

            if (this.locked) {
                return brokenQuantity;
            }

            if (brokenQuantity < 0) {
                this.quantityWarning('La quantité en panne totale est inférieure à zéro.');
                return 0;
            }

            if (brokenQuantity > this.actualQuantity) {
                this.quantityWarning('La quantité en panne totale est supérieure à la quantité présente totale.');
                return this.actualQuantity;
            }

            return brokenQuantity;
        },

        currentlyAwaitedBrokenQuantity() {
            return this.awaitedQuantity;
        },

        //
        // - Helpers
        //

        isComplete() {
            return this.actualQuantity >= this.awaitedQuantity;
        },

        isReadOnly() {
            return this.locked;
        },

        hasBroken() {
            return this.brokenQuantity > 0;
        },
    },
    methods: {
        handleActualQuantityChange(actual) {
            if (this.isReadOnly) {
                return;
            }

            const { strict } = this;

            if (actual < 0) {
                actual = 0;
            }

            if (strict && actual > this.awaitedQuantity) {
                actual = this.awaitedQuantity;
            }

            const broken = this.brokenQuantity > actual ? actual : this.brokenQuantity;
            this.$emit('change', { actual, broken });
        },

        handleBrokenQuantityChange(broken) {
            if (this.isReadOnly) {
                return;
            }

            const { strict } = this;

            if (broken < 0) {
                broken = 0;
            }

            if (strict && broken > this.awaitedQuantity) {
                broken = this.awaitedQuantity;
            }

            const actual = this.actualQuantity < broken ? broken : this.actualQuantity;
            this.$emit('change', { actual, broken });
        },

        quantityWarning(message) {
            // eslint-disable-next-line no-console
            console.warn(`Quantités inventaire invalides pour le matériel ${this.id} : ${message}`);
        },
    },
    render() {
        const {
            $t: __,
            material,
            error,
            locked,
            strict,
            isComplete,
            isReadOnly,
            hasBroken,
            awaitedQuantity,
            brokenQuantity,
            actualQuantity,
            handleActualQuantityChange,
            handleBrokenQuantityChange,
            currentlyAwaitedActualQuantity,
            currentlyAwaitedBrokenQuantity,
        } = this;
        const { reference, name } = material;

        const itemClasses = {
            'InventoryItemMaterial': true,
            'InventoryItemMaterial--read-only': isReadOnly,
            'InventoryItemMaterial--complete': isComplete && actualQuantity > 0,
            'InventoryItemMaterial--warning': hasBroken,
            'InventoryItemMaterial--error': !!error || (locked && !isComplete),
        };

        return (
            <div class={itemClasses}>
                <div class="InventoryItemMaterial__reference">{reference}</div>
                <div class="InventoryItemMaterial__name">{name}</div>
                <div class="InventoryItemMaterial__error">{error?.message}</div>
                <div class="InventoryItemMaterial__awaited-quantity">
                    {__('awaited-qty-dots')}
                    <strong class="InventoryItemMaterial__awaited-quantity__count">
                        {awaitedQuantity}
                    </strong>
                </div>
                <div
                    class="InventoryItemMaterial__actual-quantity"
                    title={__('actual-qty')}
                >
                    {isReadOnly ? actualQuantity : (
                        <QuantityInput
                            value={actualQuantity}
                            onChange={handleActualQuantityChange}
                            limit={!strict ? undefined : {
                                min: 0,
                                max: currentlyAwaitedActualQuantity,
                            }}
                        />
                    )}
                </div>
                <div
                    class="InventoryItemMaterial__quantity-broken"
                    title={__('out-of-order-qty')}
                >
                    {isReadOnly ? brokenQuantity : (
                        <QuantityInput
                            value={brokenQuantity}
                            onChange={handleBrokenQuantityChange}
                            limit={!strict ? undefined : {
                                min: 0,
                                max: currentlyAwaitedBrokenQuantity,
                            }}
                        />
                    )}
                </div>
            </div>
        );
    },
});

export default InventoryItemMaterial;
