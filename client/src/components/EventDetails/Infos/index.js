import './index.scss';
import Config from '@/config/globalConfig';
import EventBeneficiaries from '@/components/EventBeneficiaries';
import EventTechnicians from '@/components/EventTechnicians';
import EventTotals from '@/components/EventTotals';
import LocationText from '@/components/LocationText/LocationText.vue';

export default {
    name: 'EventDetailsInfos',
    props: {
        event: { type: Object, required: true },
        discountRate: Number,
    },
    data() {
        return {
            showBilling: Config.billingMode !== 'none',
        };
    },
    computed: {
        hasMaterials() {
            return this.event?.materials?.length > 0;
        },
    },
    render() {
        const { event, discountRate } = this.$props;
        const { $t: __, hasMaterials, showBilling } = this;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__base-infos">
                    {event.location && <LocationText location={event.location} />}
                    <EventBeneficiaries
                        beneficiaries={event.beneficiaries}
                        warningEmptyText={__('page-events.warning-no-beneficiary')}
                    />
                    <EventTechnicians eventTechnicians={event.technicians} />
                </div>
                {event.description && (
                    <p class="EventDetailsInfos__description">
                        <i class="fas fa-clipboard" />
                        {event.description}
                    </p>
                )}
                {hasMaterials && !event.isPast && (
                    <div
                        class={[
                            'EventDetailsInfos__confirmation',
                            { 'EventDetailsInfos__confirmation--confirmed': event.is_confirmed },
                        ]}
                    >
                        {!event.is_confirmed && (
                            <div>
                                <i class="fas fa-hourglass-half" />
                                {__('page-events.event-not-confirmed-help')}
                            </div>
                        )}
                        {event.is_confirmed && (
                            <div>
                                <i class="fas fa-check" />
                                {__('page-events.event-confirmed-help')}
                            </div>
                        )}
                    </div>
                )}
                {hasMaterials && (
                    <EventTotals
                        materials={event.materials}
                        withRentalPrices={showBilling && event.is_billable}
                        discountRate={discountRate || 0}
                        start={event.startDate}
                        end={event.endDate}
                    />
                )}
            </div>
        );
    },
};
