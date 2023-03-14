import './index.scss';
import { defineComponent } from '@vue/composition-api';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
import EventMissingMaterials from '@/themes/default/components/EventMissingMaterials';
import EventTotals from '@/themes/default/components/EventTotals';
import ReturnSummary from './ReturnSummary';

// @vue/component
const EventDetailsMaterials = {
    name: 'EventDetailsMaterials',
    props: {
        event: { type: Object, required: true },
    },
    computed: {
        showBilling() {
            const { is_billable: isBillable, materials } = this.event;
            return isBillable && materials.length > 0;
        },
    },
    render() {
        const { event, showBilling } = this;
        const { id, materials, is_return_inventory_done: isReturnInventoryDone } = event;

        return (
            <div class="EventDetailsMaterials">
                {isReturnInventoryDone && (
                    <ReturnSummary eventId={id} materials={materials} />
                )}
                {!isReturnInventoryDone && (
                    <EventMissingMaterials eventId={id} />
                )}
                <div class="EventDetailsMaterials__list">
                    <MaterialsSorted data={materials} withRentalPrices={showBilling} />
                </div>
                <div class="EventDetailsMaterials__totals">
                    <EventTotals event={event} />
                </div>
            </div>
        );
    },
};

export default defineComponent(EventDetailsMaterials);
