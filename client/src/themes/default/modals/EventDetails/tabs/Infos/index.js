import './index.scss';
import config from '@/globals/config';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import EventTotals from '@/themes/default/components/EventTotals';
import LocationText from '@/themes/default/components/LocationText';

// @vue/component
export default {
    name: 'EventDetailsInfos',
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return {
            showBilling: config.billingMode !== 'none',
        };
    },
    computed: {
        hasMaterials() {
            return this.event?.materials?.length > 0;
        },
    },
    render() {
        const { $t: __, event, hasMaterials, showBilling } = this;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__base-infos">
                    {event.location && <LocationText location={event.location} />}
                    <EventBeneficiaries
                        beneficiaries={event.beneficiaries}
                        warningEmptyText={__('@event.warning-no-beneficiary')}
                    />
                    <EventTechnicians eventTechnicians={event.technicians} />
                    {!!event.user && (
                        <p class="EventDetailsInfos__base-infos__creator">
                            <i class="fas fa-user EventDetailsInfos__base-infos__creator__icon" />
                            {__('created-by')} {event.user.full_name}
                        </p>
                    )}
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
                                {__('@event.event-not-confirmed-help')}
                            </div>
                        )}
                        {event.is_confirmed && (
                            <div>
                                <i class="fas fa-check" />
                                {__('@event.event-confirmed-help')}
                            </div>
                        )}
                    </div>
                )}
                {hasMaterials && (
                    <EventTotals
                        event={event}
                        withRentalPrices={showBilling && event.is_billable}
                    />
                )}
            </div>
        );
    },
};
