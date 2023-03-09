import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import EventTotals from '@/themes/default/components/EventTotals';
import LocationText from '@/themes/default/components/LocationText';
import MainBeneficiary from './components/MainBeneficiary';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';

// @vue/component
const EventDetailsInfos = {
    name: 'EventDetailsInfos',
    props: {
        event: { type: Object, required: true },
    },
    computed: {
        hasBeneficiary() {
            return this.event.beneficiaries?.length > 0;
        },

        hasMaterials() {
            return this.event.materials.length > 0;
        },

        isPast() {
            return moment(this.event.end_date).isBefore(this.now, 'day');
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeUnmount() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    render() {
        const { $t: __, event, hasBeneficiary, hasMaterials, isPast } = this;
        const {
            location,
            beneficiaries,
            technicians,
            user,
            description,
            is_confirmed: isConfirmed,
        } = event;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__people-location">
                    {hasBeneficiary && (
                        <p class="EventDetailsInfos__people-location__beneficiary">
                            <EventBeneficiaries beneficiaries={beneficiaries} />
                        </p>
                    )}
                    {location && (
                        <p class="EventDetailsInfos__people-location__location">
                            <LocationText location={location} />
                        </p>
                    )}
                    <p class="EventDetailsInfos__people-location__technicians">
                        <EventTechnicians eventTechnicians={technicians} />
                    </p>
                    {!!user && (
                        <p class="EventDetailsInfos__people-location__creator">
                            <Icon name="user" class="EventDetailsInfos__people-location__creator__icon" />
                            {__('created-by')} {user.full_name}
                        </p>
                    )}
                </div>
                {!hasBeneficiary && (
                    <p class="EventDetailsInfos__no-beneficiary">
                        {__('@event.warning-no-beneficiary')}
                    </p>
                )}
                {hasBeneficiary && (
                    <p class="EventDetailsInfos__beneficiary-details">
                        <MainBeneficiary beneficiary={beneficiaries[0]} />
                    </p>
                )}
                {description && (
                    <p class="EventDetailsInfos__description">
                        <Icon name="clipboard" class="EventDetailsInfos__description__icon" />
                        {description}
                    </p>
                )}
                {hasMaterials && !isPast && (
                    <div
                        class={[
                            'EventDetailsInfos__confirmation',
                            { 'EventDetailsInfos__confirmation--confirmed': isConfirmed },
                        ]}
                    >
                        <Icon
                            name={isConfirmed ? 'check' : 'hourglass-half'}
                            class="EventDetailsInfos__confirmation__icon"
                        />
                        {isConfirmed ? __('@event.event-confirmed-help') : __('@event.event-not-confirmed-help')}
                    </div>
                )}
                <EventTotals event={event} />
            </div>
        );
    },
};

export default defineComponent(EventDetailsInfos);
