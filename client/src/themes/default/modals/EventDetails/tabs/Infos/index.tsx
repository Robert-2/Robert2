import './index.scss';
import config from '@/globals/config';
import DateTime from '@/utils/datetime';
import { defineComponent } from '@vue/composition-api';
import { Group } from '@/stores/api/groups';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Totals from '@/themes/default/components/Totals';
import Technicians from './components/Technicians';
import MainBeneficiary from './components/MainBeneficiary';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';
import type { Beneficiary } from '@/stores/api/beneficiaries';

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
        hasBeneficiaries(): boolean {
            return this.event.beneficiaries.length > 0;
        },

        hasTechnicians(): boolean {
            if (!this.isTechniciansEnabled) {
                return false;
            }
            return this.event.technicians.length > 0;
        },

        isTeamMember(): boolean {
            return this.$store.getters['auth/is']([
                Group.ADMINISTRATION,
                Group.MANAGEMENT,
            ]);
        },

        isTechniciansEnabled(): boolean {
            return config.features.technicians;
        },

        hasMaterials(): boolean {
            return this.event.materials.length > 0;
        },

        isPast(): boolean {
            return this.event.mobilization_period.isBefore(this.now);
        },

        isEditable(): boolean {
            const { event } = this;

            return (
                // - Un événement archivé n'est pas modifiable.
                !event.is_archived &&

                // - Un événement ne peut être modifié que si son inventaire de retour
                //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
                //   d'autant que le stock global a pu être impacté suite à cet inventaire).
                !event.is_return_inventory_done
            );
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
            hasBeneficiaries,
            isTechniciansEnabled,
            hasTechnicians,
            hasMaterials,
            isTeamMember,
            isEditable,
            isPast,
        } = this;
        const {
            location,
            beneficiaries,
            technicians,
            author,
            manager,
            description,
            is_confirmed: isConfirmed,
        } = event;

        return (
            <div class="EventDetailsInfos">
                <div class="EventDetailsInfos__summary">
                    {hasBeneficiaries && (
                        <div class="EventDetailsInfos__summary__beneficiaries">
                            <Icon
                                name="address-book"
                                class="EventDetailsInfos__summary__beneficiaries__icon"
                            />
                            <div class="EventDetailsInfos__summary__beneficiaries__data">
                                <div class="EventDetailsInfos__summary__beneficiaries__names">
                                    {__('for-dots')}{' '}
                                    <ul class="EventDetailsInfos__summary__beneficiaries__list">
                                        {beneficiaries.map((beneficiary: Beneficiary) => {
                                            const { company, full_name: fullName } = beneficiary;

                                            return (
                                                <li class="EventDetailsInfos__summary__beneficiaries__list__item">
                                                    <span class="EventDetailsInfos__summary__beneficiaries__list__item__name">
                                                        {`${fullName}${company ? ` (${company.legal_name})` : ''}`}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <MainBeneficiary beneficiary={beneficiaries[0]} />
                            </div>
                        </div>
                    )}
                    {!hasBeneficiaries && (
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
                    {!!(author || manager || (isTechniciansEnabled && hasTechnicians)) && (
                        <div class="EventDetailsInfos__summary__people">
                            {!!author && (
                                <p
                                    class={[
                                        'EventDetailsInfos__summary__people__item',
                                        'EventDetailsInfos__summary__people__item--author',
                                    ]}
                                >
                                    {__('created-by')}{' '}
                                    <span class="EventDetailsInfos__summary__people__item__value">
                                        {author.full_name}
                                    </span>
                                </p>
                            )}
                            {manager !== null && (
                                <p
                                    class={[
                                        'EventDetailsInfos__summary__people__item',
                                        'EventDetailsInfos__summary__people__item--manager',
                                    ]}
                                >
                                    {__('modal.event-details.infos.manager')}{' '}
                                    <span class="EventDetailsInfos__summary__people__item__value">
                                        {manager.full_name}
                                    </span>
                                </p>
                            )}
                            {(isTechniciansEnabled && hasTechnicians) && (
                                <Technicians eventTechnicians={technicians} />
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
                        {(isTeamMember && isEditable && !isPast) && (
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
                        {(
                            isConfirmed
                                ? __('@event.event-confirmed-help')
                                : __('@event.event-not-confirmed-help')
                        )}
                    </div>
                )}
                <Totals booking={event} />
            </div>
        );
    },
});

export default EventDetailsInfos;
