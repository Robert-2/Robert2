import './index.scss';
import Fragment from '@/components/Fragment';
import config from '@/globals/config';
import Help from '@/components/Help';
import MaterialsSorted from '@/components/MaterialsSorted';
import EventMissingMaterials from '@/components/EventMissingMaterials';
import EventTotals from '@/components/EventTotals';
import ReturnSummary from './ReturnSummary';

// @vue/component
export default {
    name: 'EventDetailsMaterials',
    props: {
        event: { type: Object, required: true },
    },
    data: () => ({
        showBilling: config.billingMode !== 'none',
    }),
    computed: {
        hasMaterials() {
            return this.event?.materials?.length > 0;
        },
    },
    render() {
        const { event } = this.$props;
        const { successMessage, error, hasMaterials, showBilling } = this;

        return (
            <div class="EventDetailsMaterials">
                {(error || successMessage) && (
                    <Help message={{ type: 'success', text: successMessage }} error={error} />
                )}
                {event.is_return_inventory_done && (
                    <ReturnSummary
                        eventId={event.id}
                        isDone={event.is_return_inventory_done}
                        materials={event.materials}
                    />
                )}
                {!event.is_return_inventory_done && <EventMissingMaterials eventId={event.id} />}
                {hasMaterials && (
                    <Fragment>
                        <MaterialsSorted
                            data={event.materials}
                            withRentalPrices={showBilling && event.is_billable}
                            hideDetails={event.materials.length > 16}
                        />
                        <EventTotals
                            event={event}
                            withRentalPrices={showBilling && event.is_billable}
                        />
                    </Fragment>
                )}
            </div>
        );
    },
};
