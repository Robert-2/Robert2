import './index.scss';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import apiEvents from '@/stores/api/events';
import Button from '@/themes/default/components/Button';
import IconMessage from '@/themes/default/components/IconMessage';
import Overview from './Overview';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';

type Props = {
    /** L'événement en cours d'édition. */
    event: EventDetails,
};

type Data = {
    isConfirming: boolean,
};

/** Étape 5 de l'edition d'un événement: Récapitulatif. */
const EventStep5 = defineComponent({
    name: 'EventStep5',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    emits: ['goToStep', 'updateEvent', 'error'],
    data: (): Data => ({
        isConfirming: false,
    }),
    computed: {
        eventSummaryPdfUrl(): string {
            const { id } = this.event;
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

        handlePrevClick() {
            this.$emit('goToStep', 4);
        },

        // ------------------------------------------------------
        // -
        // -    Internal
        // -
        // ------------------------------------------------------

        async setEventConfirmation(confirmed: boolean) {
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
            handlePrevClick,
        } = this;
        const {
            is_confirmed: isConfirmed,
            beneficiaries,
            materials,
        } = event;

        return (
            <div class="EventStep5">
                <Overview event={event} />
                {materials.length > 0 && (
                    <section class="EventStep5__confirmation">
                        <h3 class="EventStep5__confirmation__title">
                            {__('page.event-edit.event-confirmation')}
                        </h3>
                        <div
                            class={['EventStep5__confirmation__help', {
                                'EventStep5__confirmation__help--confirmed': isConfirmed,
                            }]}
                        >
                            <IconMessage
                                name={isConfirmed ? 'check' : 'hourglass-half'}
                                message={(
                                    isConfirmed
                                        ? __('@event.event-confirmed-help')
                                        : __('@event.event-not-confirmed-help')
                                )}
                            />
                        </div>
                        <div class="EventStep5__confirmation__actions">
                            {!isConfirmed && (
                                <Button
                                    type="success"
                                    icon="check"
                                    loading={isConfirming}
                                    onClick={handleConfirm}
                                >
                                    {__('confirm-event')}
                                </Button>
                            )}
                            {isConfirmed && (
                                <Button
                                    type="warning"
                                    icon="hourglass-half"
                                    loading={isConfirming}
                                    onClick={handleUnconfirm}
                                >
                                    {__('unconfirm-event')}
                                </Button>
                            )}
                        </div>
                    </section>
                )}
                <section class="EventStep5__actions">
                    <Button
                        htmlType="submit"
                        type="default"
                        icon={{ name: 'arrow-left', position: 'before' }}
                        onClick={handlePrevClick}
                    >
                        {__('page.event-edit.go-to-prev-step')}
                    </Button>
                    <div class="EventStep5__actions__right">
                        {materials.length > 0 && beneficiaries.length > 0 && (
                            <Button type="secondary" icon="print" to={eventSummaryPdfUrl} external>
                                {__('print-summary')}
                            </Button>
                        )}
                        <Button type="primary" to={{ name: 'schedule' }}>
                            {__('back-to-schedule')}
                        </Button>
                    </div>
                </section>
            </div>
        );
    },
});

export default EventStep5;
