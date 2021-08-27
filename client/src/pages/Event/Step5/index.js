import './index.scss';
import Config from '@/config/globalConfig';
import EventOverview from '@/components/EventOverview';

// @vue/component
export default {
    name: 'EventStep5',
    components: { EventOverview },
    props: {
        event: { type: Object, required: true },
    },
    data() {
        return { isConfirming: false };
    },
    computed: {
        eventSummaryPdfUrl() {
            const { baseUrl } = Config;
            const { id } = this.event || { id: null };
            return `${baseUrl}/events/${id}/pdf`;
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
            const { id } = this.$props.event;
            const url = `${this.$route.meta.resource}/${id}`;
            this.isConfirming = true;

            try {
                const { data } = await this.$http.put(url, { id, is_confirmed: confirmed });
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
                <EventOverview event={event} onUpdateEvent={handleUpdateEvent} />
                {materials.length > 0 && (
                    <section class="EventStep5__confirmation">
                        <h3 class="EventStep5__confirmation__title">
                            {__('page-events.event-confirmation')}
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
                                ? __('page-events.event-confirmed-help')
                                : __('page-events.event-not-confirmed-help')}
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
                        <i class="fas fa-arrow-left" /> {__('page-events.back-to-calendar')}
                    </router-link>
                    {materials.length > 0 && beneficiaries.length > 0 && (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <a href={eventSummaryPdfUrl} target="_blank" class="button outline">
                            <i class="fas fa-print" /> {__('print-summary')}
                        </a>
                    )}
                </section>
            </div>
        );
    },
};
