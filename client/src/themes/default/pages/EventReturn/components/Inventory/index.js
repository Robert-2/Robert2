import './index.scss';
import Inventory, { DisplayGroup } from '@/themes/default/components/Inventory';

export { DisplayGroup };

// @vue/component
export default {
    name: 'EventReturnInventory',
    props: {
        materials: { type: Array, required: true },
        inventory: { type: Array, required: true },
        errors: { type: Array, default: null },
        isLocked: Boolean,
        displayGroup: {
            default: DisplayGroup.CATEGORIES,
            required: true,
            validator: (displayGroup) => (
                typeof displayGroup === 'string' &&
                Object.values(DisplayGroup).includes(displayGroup)
            ),
        },
    },
    computed: {
        awaitedMaterials() {
            return this.materials.map(({ pivot, ...material }) => ({
                ...material,
                awaited_quantity: pivot.quantity,
            }));
        },

        isAllReturned() {
            return this.awaitedMaterials.every((material) => {
                const quantities = this.inventory.find(({ id }) => material.id === id);
                if (!quantities) {
                    return false;
                }
                return quantities.actual === material.awaited_quantity;
            });
        },

        hasBroken() {
            return this.inventory.some(({ broken }) => broken > 0);
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(id, quantities) {
            this.$emit('change', id, quantities);
        },
    },
    render() {
        const {
            $t: __,
            inventory,
            awaitedMaterials,
            isLocked,
            errors,
            isAllReturned,
            displayGroup,
            hasBroken,
            handleChange,
        } = this;

        return (
            <div class="EventReturnInventory">
                {isLocked && !isAllReturned && (
                    <div class="EventReturnInventory__missing">
                        {__('page.event-return.some-material-is-missing')}
                    </div>
                )}
                <Inventory
                    inventory={inventory}
                    materials={awaitedMaterials}
                    displayGroup={displayGroup}
                    errors={errors}
                    onChange={handleChange}
                    locked={isLocked}
                    strict
                />
                {isAllReturned && (
                    <div class="EventReturnInventory__all-returned">
                        {__('page.event-return.all-material-returned')}
                    </div>
                )}
                {hasBroken && (
                    <div class="EventReturnInventory__has-broken">
                        <i class="fas fa-exclamation-triangle" />{' '}
                        {__('page.event-return.some-material-came-back-broken')}
                    </div>
                )}
            </div>
        );
    },
};
