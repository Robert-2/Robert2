import './index.scss';
import config from '@/globals/config';
import EventBeneficiaries from '@/components/EventBeneficiaries';
import EventTechnicians from '@/components/EventTechnicians';
import EventTotals from '@/components/EventTotals';
import LocationText from '@/components/LocationText';

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
        const { event } = this.$props;
        const { $t: __, hasMaterials, showBilling } = this;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__base-infos">
                    {event.location && <LocationText location={event.location} />}
                    <EventBeneficiaries
                        beneficiaries={event.beneficiaries}
                        warningEmptyText={__('@event.warning-no-beneficiary')}
                    />
                    <EventTechnicians eventTechnicians={event.technicians} />
                    {event.user?.person && (
                        <p class="EventDetailsInfos__base-infos__creator">
                            <i class="fas fa-user EventDetailsInfos__base-infos__creator__icon" />
                            {__('created-by')}
                            <router-link
                                to={`/users/${event.user.person.id}`}
                                class="EventDetailsInfos__base-infos__creator__link"
                            >
                                {event.user.person.full_name}
                            </router-link>
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
