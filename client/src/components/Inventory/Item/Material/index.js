import './index.scss';
import QuantityInput from '@/components/QuantityInput';

// @vue/component
export default {
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

        awaitedUnits() {
            const { material } = this;
            if (!material.is_unitary) {
                return [];
            }
            return material?.awaited_units ?? [];
        },

        awaitedUnitsQuantity() {
            return this.awaitedUnits.length;
        },

        awaitedQuantity() {
            const { material } = this;

            const awaitedQuantity = this.material.awaited_quantity ?? 0;
            if (this.locked) {
                return awaitedQuantity;
            }

            if (material.is_unitary && awaitedQuantity < this.awaitedUnitsQuantity) {
                this.quantityWarning('La quantité totale attendue est inférieure à la quantité d\'unités attendue.');
                return this.awaitedUnitsQuantity;
            }

            return awaitedQuantity;
        },

        awaitedExternalQuantity() {
            const { material } = this;
            if (!material.is_unitary) {
                return this.awaitedQuantity;
            }
            return this.awaitedQuantity - this.awaitedUnitsQuantity;
        },

        //
        // - Units
        //

        units() {
            return this.quantities.units ?? [];
        },

        //
        // - Actual
        //

        actualUnitsQuantity() {
            const { is_unitary: isUnitary } = this.material;
            if (!isUnitary) {
                return 0;
            }

            return this.units
                .filter((unit) => !unit.isLost)
                .length;
        },

        actualQuantity() {
            const { is_unitary: isUnitary } = this.material;
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

            if (isUnitary) {
                if (actualQuantity < this.actualUnitsQuantity) {
                    this.quantityWarning('La quantité d\'unités présentes est supérieure à la quantité présente totale.');
                    return this.actualUnitsQuantity;
                }

                const actualExternalQuantity = actualQuantity - this.actualUnitsQuantity;
                if (actualExternalQuantity > this.awaitedExternalQuantity) {
                    this.quantityWarning('La quantité externe présente est supérieure à la quantité externe totale attendue.');
                    return this.actualUnitsQuantity + this.awaitedExternalQuantity;
                }
            }

            return actualQuantity;
        },

        currentlyAwaitedActualQuantity() {
            const { is_unitary: isUnitary } = this.material;
            if (!isUnitary) {
                return this.awaitedQuantity;
            }
            return this.awaitedExternalQuantity + this.actualUnitsQuantity;
        },

        //
        // - Broken
        //

        brokenUnitsQuantity() {
            return this.units
                .filter((unit) => unit.isBroken)
                .length;
        },

        brokenQuantity() {
            const { is_unitary: isUnitary } = this.material;
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

            if (isUnitary) {
                if (brokenQuantity < this.brokenUnitsQuantity) {
                    this.quantityWarning('La quantité d\'unités en panne est supérieure à la quantité en panne totale.');
                    return this.brokenUnitsQuantity;
                }

                const brokenExternalQuantity = brokenQuantity - this.brokenUnitsQuantity;
                if (brokenExternalQuantity > this.awaitedExternalQuantity) {
                    this.quantityWarning('La quantité externe en panne est supérieure à la quantité externe totale attendue.');
                    return this.brokenUnitsQuantity + this.awaitedExternalQuantity;
                }
            }

            return brokenQuantity;
        },

        currentlyAwaitedBrokenQuantity() {
            const { is_unitary: isUnitary } = this.material;
            if (!isUnitary) {
                return this.awaitedQuantity;
            }
            return this.awaitedExternalQuantity + this.brokenUnitsQuantity;
        },

        //
        // - Helpers
        //

        isComplete() {
            return this.actualQuantity >= this.awaitedQuantity;
        },

        isReadOnly() {
            const { is_unitary: isUnitary } = this.material;

            if (this.locked || !isUnitary) {
                return this.locked;
            }

            // - Si on a plus de matériel à récupérer que d'unités (= matériel externe),
            //   on ne bloque pas l'edition de la quantité + les boutons d'incrémentation.
            return this.awaitedQuantity <= this.awaitedUnitsQuantity;
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

            const { is_unitary: isUnitary } = this.material;
            const strict = this.strict || isUnitary;

            if (actual < 0) {
                actual = 0;
            }

            if (strict && actual > this.awaitedQuantity) {
                actual = this.awaitedQuantity;
            }

            if (isUnitary) {
                if (actual < this.actualUnitsQuantity) {
                    actual = this.actualUnitsQuantity;
                }

                const actualExternalQuantity = actual - this.actualUnitsQuantity;
                if (actualExternalQuantity > this.awaitedExternalQuantity) {
                    actual = this.actualUnitsQuantity + this.awaitedExternalQuantity;
                }
            }

            const broken = this.brokenQuantity > actual ? actual : this.brokenQuantity;
            this.$emit('change', { actual, broken, units: this.units });
        },

        handleBrokenQuantityChange(broken) {
            if (this.isReadOnly) {
                return;
            }

            const { is_unitary: isUnitary } = this.material;
            const strict = this.strict || isUnitary;

            if (broken < 0) {
                broken = 0;
            }

            if (strict && broken > this.awaitedQuantity) {
                broken = this.awaitedQuantity;
            }

            if (isUnitary) {
                if (broken < this.brokenUnitsQuantity) {
                    broken = this.brokenUnitsQuantity;
                }

                const brokenExternalQuantity = broken - this.brokenUnitsQuantity;
                if (brokenExternalQuantity > this.awaitedExternalQuantity) {
                    broken = this.brokenUnitsQuantity + this.awaitedExternalQuantity;
                }
            }

            const actual = this.actualQuantity < broken ? broken : this.actualQuantity;
            this.$emit('change', { actual, broken, units: this.units });
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
            actualUnitsQuantity,
            brokenUnitsQuantity,
            handleActualQuantityChange,
            handleBrokenQuantityChange,
            currentlyAwaitedActualQuantity,
            currentlyAwaitedBrokenQuantity,
        } = this;
        const { reference, name, is_unitary: isUnitary } = material;

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
                    {__('awaited-quantity')}
                    <strong class="InventoryItemMaterial__awaited-quantity__count">
                        {awaitedQuantity}
                    </strong>
                </div>
                <div
                    class="InventoryItemMaterial__actual-quantity"
                    title={__('actual-quantity')}
                >
                    {isReadOnly ? actualQuantity : (
                        <QuantityInput
                            value={actualQuantity}
                            onChange={handleActualQuantityChange}
                            limit={!strict && !isUnitary ? undefined : {
                                min: isUnitary ? actualUnitsQuantity : 0,
                                max: currentlyAwaitedActualQuantity,
                            }}
                        />
                    )}
                </div>
                <div
                    class="InventoryItemMaterial__quantity-broken"
                    title={__('quantity-out-of-order')}
                >
                    {isReadOnly ? brokenQuantity : (
                        <QuantityInput
                            value={brokenQuantity}
                            onChange={handleBrokenQuantityChange}
                            limit={!strict && !isUnitary ? undefined : {
                                min: isUnitary ? brokenUnitsQuantity : 0,
                                max: currentlyAwaitedBrokenQuantity,
                            }}
                        />
                    )}
                </div>
            </div>
        );
    },
};
