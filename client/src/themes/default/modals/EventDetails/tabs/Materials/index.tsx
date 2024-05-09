import './index.scss';
import { defineComponent } from '@vue/composition-api';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
import EventMissingMaterials from '@/themes/default/components/EventMissingMaterials';
import EventTotals from '@/themes/default/components/EventTotals';
import ReturnSummary from './ReturnSummary';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';

type Props = {
    /** L'événement dont on souhaite afficher l'onglet des techniciens. */
    event: EventDetails,
};

/** Onglet "Materiel" de la fenêtre d'un événement. */
const EventDetailsMaterials = defineComponent({
    name: 'EventDetailsMaterials',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    computed: {
        showBilling(): boolean {
            const { is_billable: isBillable, materials } = this.event;
            return isBillable && materials.length > 0;
        },
    },
    render() {
        const { event, showBilling } = this;
        const {
            id,
            materials,
            has_missing_materials: hasMissingMaterials,
            is_return_inventory_done: isReturnInventoryDone,
        } = event;

        return (
            <div class="EventDetailsMaterials">
                {isReturnInventoryDone && (
                    <ReturnSummary eventId={id} materials={materials} />
                )}
                {(!isReturnInventoryDone && hasMissingMaterials) && (
                    <EventMissingMaterials
                        id={id}
                        class="EventDetailsMaterials__missing"
                    />
                )}
                <div class="EventDetailsMaterials__list">
                    <MaterialsSorted
                        data={materials}
                        withRentalPrices={showBilling}
                    />
                </div>
                <div class="EventDetailsMaterials__totals">
                    <EventTotals event={event} />
                </div>
            </div>
        );
    },
});

export default EventDetailsMaterials;
