import './index.scss';
import DateTime from '@/utils/datetime';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import EventTechnicians from '@/themes/default/components/EventTechnicians';
import EventTotals from '@/themes/default/components/EventTotals';
import MainBeneficiary from './components/MainBeneficiary';
import EventBeneficiaries from '@/themes/default/components/EventBeneficiaries';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';

type Props = {
    /** L'événement dont on veut afficher les informations. */
    event: EventDetails,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: DateTime,
};

/** Onglet "Informations" de la modale de détails d'un événement. */
const EventDetailsInfos = defineComponent({
    name: 'EventDetailsInfos',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: DateTime.now(),
    }),
    computed: {
        hasBeneficiary(): boolean {
            return this.event.beneficiaries?.length > 0;
        },

        hasTechnicians(): boolean {
            return this.event.technicians?.length > 0;
        },

        hasMaterials(): boolean {
            return this.event.materials.length > 0;
        },

        isPast(): boolean {
            return this.event.mobilization_period.isBefore(this.now);
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    render() {
        const {
            $t: __,
            event,
            hasBeneficiary,
            hasTechnicians,
            hasMaterials,
            isPast,
        } = this;
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
                            {__('in', { location })}
                            <a
                                rel="noopener noreferrer nofollow"
                                class="EventDetailsInfos__summary__location__link"
                                href={`https://maps.google.com/?q=${location}`}
                                title={__('open-in-google-maps')}
                                target="_blank"
                            >
                                <Icon name="external-link-alt" />
                            </a>
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
