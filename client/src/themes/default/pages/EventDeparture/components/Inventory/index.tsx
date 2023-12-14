import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
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

type InventoryData = CoreInventoryData<false, true>;
type InventoryMaterial = CoreInventoryMaterial<false, true>;
type InventoryMaterialData = CoreInventoryMaterialData<false, true>;

type Props = {
    /** L'événement dont on veut faire l'inventaire de départ. */
    event: Event,

    /** L'inventaire déjà réalisé (le cas échéant) pour l'événement. */
    inventory: InventoryData,

    /** L'affichage par groupe à utiliser. */
    displayGroup: DisplayGroup,

    /** Les éventuelles erreurs de l'inventaire (par matériel). */
    errors?: InventoryMaterialError[] | null,

    /**
     * Quand l'inventaire est en "pause", c'est à dire quand il est affiché
     * mais qu'il ne devrait pas pouvoir être modifié.
     *
     * @default false
     */
    paused?: boolean,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: number,
};

/** L'inventaire de matériel de la page d'inventaire de départ d'événement. */
const EventDepartureInventory = defineComponent({
    name: 'EventDepartureInventory',
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
        errors: {
            type: Array as PropType<Required<Props>['errors']>,
            default: null,
        },
        paused: {
            type: Boolean as PropType<Required<Props>['paused']>,
            default: false,
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
        awaitedMaterials(): Array<AwaitedMaterial<false>> {
            return this.event.materials.map(
                ({ pivot: eventMaterial, ...material }: EventMaterial): AwaitedMaterial<false> => {
                    const { quantity } = eventMaterial;

                    return {
                        ...material,
                        awaitedQuantity: quantity,
                    };
                },
            );
        },

        isComplete(): boolean {
            return this.awaitedMaterials.every((material: AwaitedMaterial) => {
                const materialInventory = this.inventory.find(({ id }: InventoryMaterial) => material.id === id);
                return materialInventory ? materialInventory.actual === material.awaitedQuantity : false;
            });
        },

        isMaterialEditable(): boolean {
            const { event } = this;

            return (
                // - Un événement archivé n'est pas modifiable.
                !event.is_archived &&

                // - Un événement ne peut être modifié que si son inventaire de retour
                //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
                //   d'autant que le stock global a pu être impacté suite à cet inventaire).
                !event.is_return_inventory_done
            );
        },

        isDone(): boolean {
            return !!this.event.is_departure_inventory_done;
        },

        globalStatus(): string | null {
            const { __, event, isDone } = this;

            if (!isDone) {
                return null;
            }

            const author = event.departure_inventory_author !== null
                ? event.departure_inventory_author.full_name
                : null;

            let relativeDate = null;
            if (event.departure_inventory_datetime !== null) {
                const inventoryDatetime = moment(event.departure_inventory_datetime);
                relativeDate = inventoryDatetime.isAfter(this.now)
                    ? inventoryDatetime.from(inventoryDatetime.clone().add(1, 'milliseconds'))
                    : inventoryDatetime.from(this.now);
            }

            if (author !== null && relativeDate !== null) {
                return __('status.with-author-date', { author, relativeDate });
            }

            if (author !== null) {
                return __('status.with-author', { author });
            }

            if (relativeDate !== null) {
                return __('status.with-date', { relativeDate });
            }

            return __('status.simple');
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
                ? `page.event-departure.${key}`
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
            isDone,
            paused,
            isComplete,
            handleChange,
        } = this;

        return (
            <div class="EventDepartureInventory">
                {isDone && (
                    <p class="EventDepartureInventory__summary">
                        {globalStatus}
                    </p>
                )}
                <Inventory
                    inventory={inventory}
                    materials={awaitedMaterials}
                    displayGroup={displayGroup}
                    errors={errors}
                    onChange={handleChange}
                    locked={isDone || [InventoryLock.STATE]}
                    paused={paused}
                    withComments
                    strict
                />
                {(!isDone && isComplete) && (
                    <div class="EventDepartureInventory__complete">
                        {__('complete-inventory-help')}
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
export default EventDepartureInventory;
