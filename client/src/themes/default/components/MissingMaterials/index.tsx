import './index.scss';
import { defineComponent } from '@vue/composition-api';
import apiEvents from '@/stores/api/events';
import { BookingEntity } from '@/stores/api/bookings';

import type { PropType } from '@vue/composition-api';
import type { Booking as BookingCore } from '@/stores/api/bookings';
import type { Event, EventMaterialWithQuantityMissing } from '@/stores/api/events';

type Booking =
    | BookingCore
    | { entity: BookingEntity.EVENT } & Event;

type BookingMaterialWithQuantityMissing =
    | EventMaterialWithQuantityMissing;

type Props = {
    /**
     * Le booking (événement ou réservation) dont on
     * veut afficher le matériel manquant.
     */
    booking: Booking,
};

type Data = {
    hasCriticalError: boolean,
    missingMaterials: BookingMaterialWithQuantityMissing[],
};

/** Liste du matériel manquant d'un booking. */
const MissingMaterials = defineComponent({
    name: 'MissingMaterials',
    props: {
        booking: {
            type: Object as PropType<Props['booking']>,
            required: true,
        },
    },
    data: (): Data => ({
        hasCriticalError: false,
        missingMaterials: [],
    }),
    computed: {
        hasMissingMaterials(): boolean {
            return this.missingMaterials.length > 0;
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { booking } = this;
            try {
                // TODO: Utiliser directement un endpoint de `/api/bookings`.
                this.missingMaterials = await (() => {
                    if (booking.entity === BookingEntity.EVENT) {
                        return apiEvents.missingMaterials(booking.id);
                    }
                    throw new Error(`Unsupported entity ${(booking as any).entity}`);
                })();
            } catch {
                this.hasCriticalError = true;
            }
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `components.MissingMaterials.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            missingMaterials,
            hasCriticalError,
            hasMissingMaterials,
        } = this;

        if (hasCriticalError) {
            return (
                <div class="MissingMaterials">
                    <div class="MissingMaterials__header">
                        <h3 class="MissingMaterials__header__title">
                            {__('title')}
                        </h3>
                    </div>
                    <p class="MissingMaterials__error">
                        {__('global.errors.unexpected-while-fetching')}
                    </p>
                </div>
            );
        }

        if (!hasMissingMaterials) {
            return null;
        }

        return (
            <div class="MissingMaterials">
                <div class="MissingMaterials__header">
                    <h3 class="MissingMaterials__header__title">
                        {__('title')}
                    </h3>
                    <p class="MissingMaterials__header__help">
                        {__('help.event')}
                    </p>
                </div>
                <ul class="MissingMaterials__list">
                    {missingMaterials.map((missingMaterial: BookingMaterialWithQuantityMissing) => (
                        <li key={missingMaterial.id} class="MissingMaterials__list__item">
                            <div class="MissingMaterials__list__item__name">
                                {missingMaterial.name}
                            </div>
                            <div class="MissingMaterials__list__item__quantity">
                                {__('missing-count', {
                                    quantity: missingMaterial.quantity,
                                    missing: missingMaterial.quantity_missing,
                                })}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    },
});

export default MissingMaterials;
