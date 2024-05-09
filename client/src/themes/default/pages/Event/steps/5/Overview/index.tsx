import './index.scss';
import { defineComponent } from '@vue/composition-api';
import upperFirst from 'lodash/upperFirst';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';
import Link from '@/themes/default/components/Link';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
import EventMissingMaterials from '@/themes/default/components/EventMissingMaterials';
import IconMessage from '@/themes/default/components/IconMessage';
import EventTotals from '@/themes/default/components/EventTotals';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import { PeriodReadableFormat } from '@/utils/period';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type {
    TechnicianPeriod,
    TechnicianWithPeriods,
} from '@/utils/formatEventTechniciansList';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,
};

/** Récapitulatif (étape 5) de l'édition d'événement. */
const EventStep5Overview = defineComponent({
    name: 'EventStep5Overview',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    computed: {
        arePeriodsUnified(): boolean {
            const {
                operation_period: operationPeriod,
                mobilization_period: mobilizationPeriod,
            } = this.event;

            return operationPeriod
                .setFullDays(false)
                .isSame(mobilizationPeriod);
        },

        duration(): number {
            const { operation_period: operationPeriod } = this.event;
            return operationPeriod.asDays();
        },

        hasMaterials(): boolean {
            return this.event.materials.length > 0;
        },

        hasLocation(): boolean {
            return !!(
                this.event.location &&
                this.event.location.length > 0
            );
        },

        hasDescription(): boolean {
            return !!(
                this.event.description &&
                this.event.description.length > 0
            );
        },

        technicians(): TechnicianWithPeriods[] {
            return formatEventTechniciansList(this.event.technicians);
        },
    },
    render() {
        const {
            $t: __,
            event,
            duration,
            technicians,
            hasLocation,
            hasMaterials,
            hasDescription,
            arePeriodsUnified,
        } = this;
        const { beneficiaries } = event;

        return (
            <div class="EventStep5Overview">
                <header class="EventStep5Overview__header">
                    <h1 class="EventStep5Overview__title">{event.title}</h1>
                    <div class="EventStep5Overview__summary">
                        {hasLocation && (
                            <h2 class="EventStep5Overview__summary__data">
                                <Icon name="map-marker-alt" class="EventStep5Overview__summary__data__icon" />
                                <span class="EventStep5Overview__summary__data__content">
                                    {event.location!}
                                </span>
                            </h2>
                        )}
                        <h2 class="EventStep5Overview__summary__data">
                            <Icon name="calendar-alt" class="EventStep5Overview__summary__data__icon" />
                            <span class="EventStep5Overview__summary__data__content">
                                {upperFirst(event.operation_period.toReadable(__))}
                            </span>
                        </h2>
                        <h2 class="EventStep5Overview__summary__data">
                            <Icon name="stopwatch" class="EventStep5Overview__summary__data__icon" />
                            <span class="EventStep5Overview__summary__data__content">
                                {__('days-count', { duration }, duration)}
                            </span>
                        </h2>
                        {!arePeriodsUnified && (
                            <h2 class="EventStep5Overview__summary__data">
                                <Icon name="clock" class="EventStep5Overview__summary__data__icon" />
                                <span class="EventStep5Overview__summary__data__content">
                                    {__('mobilization-period', {
                                        period: event.mobilization_period.toReadable(__),
                                    })}
                                </span>
                            </h2>
                        )}
                    </div>
                    {hasDescription && (
                        <p class="EventStep5Overview__description">
                            {event.description!}
                        </p>
                    )}
                </header>
                {(beneficiaries.length > 0 || technicians.length > 0) && (
                    <div class="EventStep5Overview__participants">
                        {beneficiaries.length > 0 && (
                            <div
                                class={[
                                    'EventStep5Overview__participants__item',
                                    'EventStep5Overview__participants__item--beneficiaries',
                                ]}
                            >
                                <h4 class="EventStep5Overview__participants__item__title">
                                    {__('page.event-edit.event-beneficiaries')}
                                </h4>
                                <ul class="EventStep5Overview__participants__item__values">
                                    {beneficiaries.map((beneficiary: Beneficiary) => {
                                        let label = (
                                            <Link
                                                to={{ name: 'view-beneficiary', params: { id: beneficiary.id } }}
                                                class="EventStep5Overview__participants__item__values__item__link"
                                            >
                                                {beneficiary.full_name}
                                            </Link>
                                        );

                                        if (beneficiary.company) {
                                            label = <Fragment>{label} ({beneficiary.company.legal_name})</Fragment>;
                                        }

                                        return (
                                            <li
                                                key={beneficiary.id}
                                                class="EventStep5Overview__participants__item__values__item"
                                            >
                                                {label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {technicians.length > 0 && (
                            <div
                                class={[
                                    'EventStep5Overview__participants__item',
                                    'EventStep5Overview__participants__item--technicians',
                                ]}
                            >
                                <h4 class="EventStep5Overview__participants__item__title">
                                    {__('page.event-edit.event-technicians')}
                                </h4>
                                <ul class="EventStep5Overview__participants__item__values">
                                    {technicians.map((technician: TechnicianWithPeriods) => (
                                        <li
                                            key={technician.id}
                                            class="EventStep5Overview__participants__item__values__item"
                                        >
                                            <div class="EventStep5Overview__participants__technician">
                                                <div class="EventStep5Overview__participants__technician__name">
                                                    <Link
                                                        class="EventStep5Overview__participants__item__values__item__link"
                                                        to={{ name: 'view-technician', params: { id: technician.id } }}
                                                    >
                                                        {technician.name}
                                                    </Link>
                                                    {!!technician.phone && (
                                                        <Fragment>
                                                            {' '}-{' '}
                                                            <span>{technician.phone}</span>
                                                        </Fragment>
                                                    )}
                                                </div>
                                                <ul class="EventStep5Overview__participants__technician__periods">
                                                    {technician.periods.map(({ id, period, position }: TechnicianPeriod) => (
                                                        <li
                                                            key={id}
                                                            class="EventStep5Overview__participants__technician__periods__item"
                                                        >
                                                            {period.toReadable(__, PeriodReadableFormat.MINIMALIST)}
                                                            {!!(position && position.length > 0) && (
                                                                <Fragment>
                                                                    {' '}:{' '}
                                                                    <span>{position}</span>
                                                                </Fragment>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                <div class="EventStep5Overview__materials">
                    <h3 class="EventStep5Overview__materials__title">
                        {__('page.event-edit.event-materials')}
                    </h3>
                    {!hasMaterials && (
                        <p class="EventStep5Overview__materials__empty">
                            <IconMessage
                                name="exclamation-triangle"
                                message={__('@event.warning-no-material')}
                            />
                        </p>
                    )}
                    {hasMaterials && (
                        <Fragment>
                            {!!event.has_missing_materials && (
                                <div class="EventStep5Overview__materials__missing">
                                    <EventMissingMaterials id={event.id} />
                                </div>
                            )}
                            <div class="EventStep5Overview__materials__list">
                                <MaterialsSorted
                                    data={event.materials}
                                    withRentalPrices={event.is_billable}
                                />
                            </div>
                            <div class="EventStep5Overview__materials__totals">
                                <EventTotals event={event} />
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
        );
    },
});

export default EventStep5Overview;
