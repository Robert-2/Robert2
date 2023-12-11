import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';
import MaterialsSorted from '@/themes/default/components/MaterialsSorted';
import EventMissingMaterials from '@/themes/default/components/EventMissingMaterials';
import EventTotals from '@/themes/default/components/EventTotals';

// @vue/component
const EventStep5Overview = defineComponent({
    name: 'EventStep5Overview',
    props: {
        event: { type: Object, required: true },
    },
    data: () => ({
        unsavedDiscountRate: null,
        isCreating: false,
        deletingId: null,
        successMessage: null,
        error: null,
    }),
    computed: {
        technicians() {
            return formatEventTechniciansList(this.event.technicians);
        },

        hasMaterials() {
            return this.event.materials.length > 0;
        },

        fromToDates() {
            return {
                from: moment(this.event.start_date).format('L'),
                to: moment(this.event.end_date).format('L'),
            };
        },
    },
    render() {
        const { $t: __, event, technicians, fromToDates, hasMaterials } = this;
        const { duration } = event;

        return (
            <div class="EventStep5Overview">
                <h1 class="EventStep5Overview__title">{event.title}</h1>
                <div class="EventStep5Overview__header">
                    <section class="EventStep5Overview__section">
                        {!event.location && (
                            <h2 class="EventStep5Overview__dates">
                                <Icon name="calendar-alt" />
                                {__('from-date-to-date', fromToDates)}
                            </h2>
                        )}
                        {event.location && (
                            <h2 class="EventStep5Overview__location">
                                <Icon name="map-marker-alt" />
                                {__('in', { location: event.location ?? '?' })},{' '}
                                {__('from-date-to-date', fromToDates)}
                            </h2>
                        )}
                    </section>
                    <section class="EventStep5Overview__section">
                        <h2 class="EventStep5Overview__duration">
                            <Icon name="clock" />{' '}
                            {__('duration')} {__('days-count', { duration: duration.days }, duration.days)}
                        </h2>
                    </section>
                </div>
                {!!event.description && (
                    <p class="EventStep5Overview__description">
                        <Icon name="clipboard" /> {event.description}
                    </p>
                )}
                <div class="EventStep5Overview__main">
                    {event.beneficiaries.length > 0 && (
                        <section class="EventStep5Overview__section">
                            <dl class="EventStep5Overview__info EventStep5Overview__info--vertical">
                                <dt class="EventStep5Overview__info__term">
                                    <Icon name="address-book" />{' '}
                                    {__('page.event-edit.event-beneficiaries')}
                                </dt>
                                <dd class="EventStep5Overview__info__value">
                                    <ul class="EventStep5Overview__info__list">
                                        {event.beneficiaries.map((beneficiary) => (
                                            <li key={beneficiary.id} class="EventStep5Overview__info__list-item">
                                                <router-link to={{ name: 'edit-beneficiary', params: { id: beneficiary.id } }}>
                                                    {beneficiary.full_name}
                                                </router-link>
                                                {!!beneficiary.company && (
                                                    <Fragment>
                                                        {' '}
                                                        <router-link to={{ name: 'edit-company', params: { id: beneficiary.company.id } }}>
                                                            {beneficiary.company.legal_name}
                                                        </router-link>
                                                    </Fragment>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </dl>
                        </section>
                    )}
                    {technicians.length > 0 && (
                        <section class="EventStep5Overview__section">
                            <dl class="EventStep5Overview__info EventStep5Overview__info--vertical">
                                <dt class="EventStep5Overview__info__term">
                                    <Icon name="people-carry" />{' '}
                                    {__('page.event-edit.event-technicians')}
                                </dt>
                                <dd class="EventStep5Overview__info__value">
                                    <ul class="EventStep5Overview__info__list">
                                        {technicians.map((technician) => (
                                            <li key={technician.id} class="EventStep5Overview__info__list-item">
                                                <router-link
                                                    class="EventStep5Overview__info__link"
                                                    to={{
                                                        name: 'edit-technician',
                                                        params: { id: technician.id },
                                                        hash: '#infos',
                                                    }}
                                                >
                                                    {technician.name}
                                                </router-link>
                                                {!!technician.phone && (
                                                    <Fragment>
                                                        {' '}-{' '}
                                                        <span>{technician.phone}</span>
                                                    </Fragment>
                                                )}
                                                <br />
                                                <ul class="EventStep5Overview__technician-periods">
                                                    {technician.periods.map((period) => (
                                                        <li
                                                            key={period.id}
                                                            class="EventStep5Overview__technician-periods__item"
                                                        >
                                                            {period.from.format('DD MMM LT')}
                                                            {' '}⇒{' '}
                                                            {period.to.format('DD MMM LT')}
                                                            {' '}:{' '}
                                                            {period.position}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </dl>
                        </section>
                    )}
                </div>
                <div class="EventStep5Overview__materials">
                    <h3 class="EventStep5Overview__materials__title">
                        <Icon name="box" /> {__('page.event-edit.event-materials')}
                    </h3>
                    {!hasMaterials && (
                        <p class="EventStep5Overview__materials__empty">
                            <Icon name="exclamation-triangle" />{' '}
                            {__('@event.warning-no-material')}
                        </p>
                    )}
                    {hasMaterials && (
                        <Fragment>
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
                <div class="EventStep5Overview__missing-materials">
                    <EventMissingMaterials eventId={event.id} />
                </div>
            </div>
        );
    },
});

export default EventStep5Overview;
