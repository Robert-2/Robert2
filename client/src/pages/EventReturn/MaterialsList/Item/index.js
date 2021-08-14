import './index.scss';
import QuantityInput from '@/components/QuantityInput';

// @vue/component
const EventReturnMaterialItem = {
    name: 'EventReturnMaterialItem',
    components: { QuantityInput },
    props: {
        id: Number,
        reference: String,
        name: String,
        quantities: Object,
        error: Object,
        isLocked: Boolean,
    },
    computed: {
        isComplete() {
            return this.quantities.out === this.quantities.returned;
        },

        hasBroken() {
            return this.quantities.broken > 0;
        },
    },
    methods: {
        setQuantityReturned({ id }, quantity) {
            this.$emit('updateQuantityReturned', { id, quantity });

            if (this.quantities.broken > quantity) {
                this.$emit('updateQuantityBroken', { id, quantity });
            }
        },

        setQuantityBroken({ id }, quantity) {
            this.$emit('updateQuantityBroken', { id, quantity });

            if (this.quantities.returned < quantity) {
                this.$emit('updateQuantityReturned', { id, quantity });
            }
        },
    },
    render() {
        const {
            $t: __,
            id,
            reference,
            name,
            quantities,
            error,
            isLocked,
            isComplete,
            hasBroken,
            setQuantityReturned,
            setQuantityBroken,
        } = this;

        const itemClasses = {
            'EventReturnMaterialItem': true,
            'EventReturnMaterialItem--locked': isLocked,
            'EventReturnMaterialItem--complete': isComplete,
            'EventReturnMaterialItem--warning': hasBroken,
            'EventReturnMaterialItem--error': !!error || (isLocked && !isComplete),
        };

        return (
            <li class={itemClasses}>
                <div class="EventReturnMaterialItem__reference">{reference}</div>
                <div class="EventReturnMaterialItem__name">{name}</div>
                <div class="EventReturnMaterialItem__error">{error?.message}</div>
                <div class="EventReturnMaterialItem__quantity-out">
                    {__('out', {}, quantities.out)}{' '}
                    <strong class="EventReturnMaterialItem__quantity-out__count">
                        {quantities.out}
                    </strong>
                </div>
                <div
                    class="EventReturnMaterialItem__quantity-returned"
                    title={__('quantity-returned')}
                >
                    {isLocked ? quantities.returned : (
                        <QuantityInput
                            limit={quantities.out}
                            allowOverflow={false}
                            material={{ id }}
                            quantity={quantities.returned}
                            onQuantityChange={setQuantityReturned}
                        />
                    )}
                </div>
                <div
                    class="EventReturnMaterialItem__quantity-broken"
                    title={__('quantity-out-of-order')}
                >
                    {isLocked ? quantities.broken : (
                        <QuantityInput
                            limit={quantities.out}
                            allowOverflow={false}
                            material={{ id }}
                            quantity={quantities.broken}
                            onQuantityChange={setQuantityBroken}
                        />
                    )}
                </div>
            </li>
        );
    },
};

export default EventReturnMaterialItem;
