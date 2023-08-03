import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import EventTotals from '@/themes/default/components/EventTotals';
import LocationText from '@/themes/default/components/LocationText';
import MainBeneficiary from './components/MainBeneficiary';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';

// @vue/component
const EventDetailsInfos = defineComponent({
    name: 'EventDetailsInfos',
    props: {
        event: { type: Object, required: true },
    },
    computed: {
        hasBeneficiary() {
            return this.event.beneficiaries?.length > 0;
        },

        hasTechnicians() {
            return this.event.technicians?.length > 0;
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
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    render() {
        const { $t: __, event, hasBeneficiary, hasTechnicians, hasMaterials, isPast } = this;
        const {
            location,
            beneficiaries,
            technicians,
            author,
            description,
            is_confirmed: isConfirmed,
        } = event;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__summary">
                    {hasBeneficiary && (
                        <div class="EventDetailsInfos__summary__beneficiaries">
                            <EventBeneficiaries
                                beneficiaries={beneficiaries}
                                class="EventDetailsInfos__summary__beneficiaries__list"
                            />
                            <MainBeneficiary beneficiary={beneficiaries[0]} />
                        </div>
                    )}
                    {!hasBeneficiary && (
                        <div class="EventDetailsInfos__no-beneficiary">
                            {__('@event.warning-no-beneficiary')}
                        </div>
                    )}
                    {!!location && (
                        <div class="EventDetailsInfos__summary__location">
                            <LocationText location={location} />
                        </div>
                    )}
                    {!!(author || hasTechnicians) && (
                        <div class="EventDetailsInfos__summary__people">
                            {!!author && (
                                <p class="EventDetailsInfos__summary__author">
                                    {__('created-by')} {author.full_name}
                                </p>
                            )}
                            {hasTechnicians && (
                                <EventTechnicians eventTechnicians={technicians} />
                            )}
                        </div>
                    )}
                </div>
                {description && (
                    <p class="EventDetailsInfos__description">
                        {description}
                    </p>
                )}
                {!hasMaterials && (
                    <div class="EventDetailsInfos__no-material">
                        {__('@event.warning-no-material')}
                        {!isPast && (
                            <p>
                                <Button
                                    type="primary"
                                    to={{ name: 'edit-event', params: { id: event.id } }}
                                    icon="edit"
                                >
                                    {__('modal.event-details.edit')}
                                </Button>
                            </p>
                        )}
                    </div>
                )}
                {hasMaterials && !isPast && (
                    <div
                        class={[
                            'EventDetailsInfos__confirmation',
                            { 'EventDetailsInfos__confirmation--confirmed': isConfirmed },
                        ]}
                    >
                        {isConfirmed ? __('@event.event-confirmed-help') : __('@event.event-not-confirmed-help')}
                    </div>
                )}
                <EventTotals event={event} />
            </div>
        );
    },
});

export default EventDetailsInfos;
