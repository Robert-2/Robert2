import './index.scss';
import config from '@/globals/config';
import apiEvents from '@/stores/api/events';
import Overview from './Overview';

// @vue/component
export default {
    name: 'EventStep5',
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return { isConfirming: false };
    },
    computed: {
        eventSummaryPdfUrl() {
            const { id } = this.event || { id: null };
            return `${config.baseUrl}/events/${id}/pdf`;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleConfirm() {
            this.setEventConfirmation(true);
        },

        handleUnconfirm() {
            this.setEventConfirmation(false);
        },

        handleUpdateEvent(newEvent) {
            this.$emit('updateEvent', newEvent);
        },

        // ------------------------------------------------------
        // -
        // -    Internal
        // -
        // ------------------------------------------------------

        async setEventConfirmation(confirmed) {
            const { id } = this.event;
            this.isConfirming = true;

            try {
                const data = await apiEvents.update(id, { is_confirmed: confirmed });
                this.$emit('updateEvent', data);
            } catch (error) {
                this.$emit('error', error);
            } finally {
                this.isConfirming = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            event,
            isConfirming,
            eventSummaryPdfUrl,
            handleConfirm,
            handleUnconfirm,
            handleUpdateEvent,
        } = this;

        const { is_confirmed: isConfirmed, materials, beneficiaries } = event;

        return (
            <div class="EventStep5">
                <Overview event={event} onUpdateEvent={handleUpdateEvent} />
                {materials.length > 0 && (
                    <section class="EventStep5__confirmation">
                        <h3 class="EventStep5__confirmation__title">
                            {__('page.event-edit.event-confirmation')}
                        </h3>
                        <div
                            class={[
                                'EventStep5__confirmation__help',
                                { 'EventStep5__confirmation__help--confirmed': isConfirmed },
                            ]}
                        >
                            {!isConfirming && (
                                <i
                                    class={['fas', 'EventStep5__confirmation__icon', {
                                        'fa-check': isConfirmed,
                                        'fa-hourglass-half': !isConfirmed,
                                    }]}
                                />
                            )}
                            {isConfirmed
                                ? __('@event.event-confirmed-help')
                                : __('@event.event-not-confirmed-help')}
                        </div>
                        <div class="EventStep5__confirmation__actions">
                            {!isConfirmed && (
                                <button type="button" class="success" onClick={handleConfirm}>
                                    <i
                                        class={['fas', {
                                            'fa-circle-notch fa-spin': isConfirming,
                                            'fa-check': !isConfirming,
                                        }]}
                                    />{' '}
                                    {__('confirm-event')}
                                </button>
                            )}
                            {isConfirmed && (
                                <button type="button" class="warning" onClick={handleUnconfirm}>
                                    <i
                                        class={['fas', {
                                            'fa-circle-notch fa-spin': isConfirming,
                                            'fa-hourglass-half': !isConfirming,
                                        }]}
                                    />{' '}
                                    {__('unconfirm-event')}
                                </button>
                            )}
                        </div>
                    </section>
                )}
                <section>
                    <router-link to="/" exact class="button info EventStep5__back-btn">
                        <i class="fas fa-arrow-left" /> {__('page.event-edit.back-to-calendar')}
                    </router-link>
                    {materials.length > 0 && beneficiaries.length > 0 && (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <a href={eventSummaryPdfUrl} target="_blank" class="button outline">
                            <i class="fas fa-print" />&nbsp;{__('print-summary')}
                        </a>
                    )}
                </section>
            </div>
        );
    },
};
