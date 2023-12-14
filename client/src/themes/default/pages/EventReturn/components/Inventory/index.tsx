import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import IconMessage from '@/themes/default/components/IconMessage';
import Inventory, {
    DisplayGroup,
    InventoryLock,
    InventoryErrorsSchema,
} from '@/themes/default/components/Inventory';

import type { PropType } from '@vue/composition-api';
import type { Event, EventMaterial } from '@/stores/api/events';
import type {
    AwaitedMaterial,
    InventoryData as CoreInventoryData,
    InventoryMaterial as CoreInventoryMaterial,
    InventoryMaterialData as CoreInventoryMaterialData,
    InventoryMaterialError,
} from '@/themes/default/components/Inventory';

type InventoryData = CoreInventoryData<true, true>;
type InventoryMaterial = CoreInventoryMaterial<true, true>;
type InventoryMaterialData = CoreInventoryMaterialData<true, true>;

type Props = {
    /** L'événement dont on veut faire l'inventaire de retour. */
    event: Event,

    /** L'inventaire déjà réalisé (le cas échéant) pour l'événement. */
    inventory: InventoryData,

    /** L'affichage par groupe à utiliser. */
    displayGroup: DisplayGroup,

    /** Indique si l'inventaire de retour peut-être "terminée" ou non. */
    canTerminate: boolean,

    /** Les éventuelles erreurs de l'inventaire (par matériel). */
    errors?: InventoryMaterialError[] | null,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: number,
};

/** L'inventaire de matériel de la page d'inventaire de retour d'événement. */
const EventReturnInventory = defineComponent({
    name: 'EventReturnInventory',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
        inventory: {
            type: Array as PropType<Required<Props>['inventory']>,
            required: true,
        },
        displayGroup: {
            type: String as PropType<Required<Props>['displayGroup']>,
            required: true,
            validator: (displayGroup: unknown): boolean => (
                typeof displayGroup === 'string' &&
                (Object.values(DisplayGroup) as string[]).includes(displayGroup)
            ),
        },
        canTerminate: {
            type: Boolean as PropType<Props['canTerminate']>,
            required: true,
        },
        errors: {
            type: Array as PropType<Required<Props>['errors']>,
            default: null,
        },
    },
    emits: ['change'],
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: Date.now(),
    }),
    computed: {
        awaitedMaterials(): AwaitedMaterial[] {
            const { isDepartureInventoryDone } = this;

            return this.event.materials.map(
                ({ pivot: eventMaterial, ...material }: EventMaterial) => {
                    const { quantity } = eventMaterial;

                    return {
                        ...material,
                        awaitedQuantity: quantity,
                        comment: isDepartureInventoryDone
                            ? (eventMaterial.departure_comment ?? null)
                            : null,
                    };
                },
            );
        },

        isAllReturned(): boolean {
            return this.awaitedMaterials.every((material: AwaitedMaterial) => {
                const materialInventory = this.inventory.find(({ id }: InventoryMaterial) => material.id === id);
                return materialInventory ? materialInventory.actual === material.awaitedQuantity : false;
            });
        },

        isDone(): boolean {
            return !!this.event.is_return_inventory_done;
        },

        isDepartureInventoryDone(): boolean {
            return !!this.event.is_departure_inventory_done;
        },

        hasBroken(): boolean {
            return this.inventory.some(
                ({ broken }: InventoryMaterial) => broken > 0,
            );
        },

        hasStarted(): boolean {
            return !!this.event.is_return_inventory_started;
        },

        globalStatus(): string | null {
            const { __, event, isDone } = this;

            if (!isDone) {
                return null;
            }

            const author = event.return_inventory_author !== null
                ? event.return_inventory_author.full_name
                : null;

            let relativeDate = null;
            if (event.return_inventory_datetime !== null) {
                const inventoryDatetime = moment(event.return_inventory_datetime);
                relativeDate = inventoryDatetime.isAfter(this.now)
                    ? inventoryDatetime.from(inventoryDatetime.clone().add(1, 'milliseconds'))
                    : inventoryDatetime.from(this.now);
            }

            if (author !== null && relativeDate !== null) {
                return __('statuses.done.with-author-date', { author, relativeDate });
            }

            if (author !== null) {
                return __('statuses.done.with-author', { author });
            }

            if (relativeDate !== null) {
                return __('statuses.done.with-date', { relativeDate });
            }

            return __('statuses.done.simple');
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les 10 secondes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 10_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(id: AwaitedMaterial['id'], materialInventory: InventoryMaterialData) {
            this.$emit('change', id, materialInventory);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.event-return.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            globalStatus,
            inventory,
            displayGroup,
            awaitedMaterials,
            errors,
            hasBroken,
            hasStarted,
            isDone,
            isAllReturned,
            canTerminate,
            handleChange,
        } = this;

        return (
            <div class="EventReturnInventory">
                {isDone && (
                    <div class="EventReturnInventory__summary">
                        <p class="EventReturnInventory__summary__introduction">
                            {globalStatus}
                        </p>
                        <div class="EventReturnInventory__summary__statuses">
                            {isAllReturned && (
                                <IconMessage
                                    name="check"
                                    message={__('statuses.all-material-returned')}
                                    class={[
                                        'EventReturnInventory__summary__statuses__item',
                                        'EventReturnInventory__summary__statuses__item--all-returned',
                                    ]}
                                />
                            )}
                            {!isAllReturned && (
                                <IconMessage
                                    name="exclamation-triangle"
                                    message={__('statuses.some-material-is-missing')}
                                    class={[
                                        'EventReturnInventory__summary__statuses__item',
                                        'EventReturnInventory__summary__statuses__item--missing',
                                    ]}
                                />
                            )}
                            {hasBroken && (
                                <IconMessage
                                    name="exclamation-triangle"
                                    message={__('statuses.some-material-came-back-broken')}
                                    class={[
                                        'EventReturnInventory__summary__statuses__item',
                                        'EventReturnInventory__summary__statuses__item--has-broken',
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                )}
                <Inventory
                    inventory={inventory}
                    materials={awaitedMaterials}
                    displayGroup={displayGroup}
                    errors={errors}
                    onChange={handleChange}
                    locked={isDone || [
                        InventoryLock.STATE,
                        InventoryLock.COMMENT,
                    ]}
                    withBrokenCount
                    withComments
                    strict
                />
                {(!isDone && hasStarted && isAllReturned) && (
                    <div class="EventReturnInventory__complete">
                        {!canTerminate && __('alerts.all-material-returned-draft')}
                        {canTerminate && __('alerts.all-material-returned')}
                    </div>
                )}
            </div>
        );
    },
});

export type {
    InventoryData,
    InventoryMaterial,
    InventoryMaterialData,
    InventoryMaterialError,
};

export { DisplayGroup, InventoryErrorsSchema };
export default EventReturnInventory;
