import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Inventory, { DisplayGroup } from '@/themes/default/components/Inventory';
import IconMessage from '@/themes/default/components/IconMessage';

export { DisplayGroup };

// @vue/component
const EventReturnInventory = defineComponent({
    name: 'EventReturnInventory',
    props: {
        event: { type: Object, required: true },
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
    emits: ['change'],
    computed: {
        hasStarted() {
            return !!this.event.is_return_inventory_started;
        },

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
            hasStarted,
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
                {!hasStarted && (
                    <div class="EventReturnInventory__not-saved">
                        <IconMessage
                            name="exclamation-triangle"
                            message={__('page.event-return.not-saved-yet')}
                        />
                    </div>
                )}
                {hasBroken && (
                    <div class="EventReturnInventory__has-broken">
                        <IconMessage
                            name="exclamation-triangle"
                            message={__('page.event-return.some-material-came-back-broken')}
                        />
                    </div>
                )}
                {(hasStarted && isAllReturned) && (
                    <div class="EventReturnInventory__all-returned">
                        {__('page.event-return.all-material-returned')}
                    </div>
                )}
            </div>
        );
    },
});

export default EventReturnInventory;
