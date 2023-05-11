import './index.scss';
import EventDetails from '@/themes/default/modals/EventDetails';
import MonthCalendar from '@/themes/default/components/MonthCalendar';
import ErrorMessage from '@/themes/default/components/ErrorMessage';
import Loading from '@/themes/default/components/Loading';
import formatEventTechnician from '@/utils/formatEventTechnician';
import showModal from '@/utils/showModal';

// @vue/component
export default {
    name: 'TechnicianViewSchedule',
    props: {
        technician: { type: Object, required: true },
    },
    data() {
        return {
            isLoading: false,
            error: null,
            technicianEvents: [],
            hasClickedItemId: null,
            doubleClickTimeoutId: null,
        };
    },
    computed: {
        events() {
            return this.technicianEvents.map((technicianEvent) => {
                const { id, eventId, title, start, end } = formatEventTechnician(technicianEvent);
                const { color, is_confirmed: isConfirmed } = technicianEvent.event;
                const isPast = end.isBefore(new Date(), 'day');

                // - Si la date de fin est minuit du jour suivant, on la met à la seconde précédente
                //   pour éviter que le slot apparaisse dans le jour suivant sur le calendrier.
                const endDate = end.format('HH:mm:ss') === '00:00:00'
                    ? end.clone().subtract(1, 'seconds')
                    : end;

                return {
                    id,
                    title,
                    color,
                    eventId,
                    startDate: start,
                    endDate,
                    className: ['TechnicianViewSchedule__item', {
                        'TechnicianViewSchedule__item--past': isPast,
                        'TechnicianViewSchedule__item--not-confirmed': !isConfirmed,
                    }],
                };
            });
        },
    },
    mounted() {
        this.fetchEvents();
    },
    beforeDestroy() {
        if (this.doubleClickTimeoutId) {
            clearTimeout(this.doubleClickTimeoutId);
        }
    },
    methods: {
        async fetchEvents() {
            const { id } = this.$props.technician;

            this.isLoading = true;

            try {
                const { data } = await this.$http.get(`technicians/${id}/events`);
                this.technicianEvents = data;
            } catch (error) {
                // TODO: Lever une exception qui doit être catchée dans la page plutôt que de gérer ça dans l'onglet.
                //       Cf. la page d'edition du matériel (`errorCaptured`) + State `criticalError` dans le <Form>.
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        handleClickItem(item) {
            const { eventId } = item;
            if (this.hasClickedItemId === eventId) {
                this.openEventModal(eventId);
                this.hasClickedItemId = null;
                return;
            }

            this.hasClickedItemId = eventId;
            this.doubleClickTimeoutId = setTimeout(() => {
                this.hasClickedItemId = null;
            }, 300);
        },

        openEventModal(id) {
            showModal(this.$modal, EventDetails, {
                id,
                openedTab: 'technicians',
                onClose: () => { this.fetchEvents(); },
            });
        },
    },
    render() {
        const { isLoading, error, events, handleClickItem } = this;

        const render = () => {
            if (isLoading) {
                return <Loading />;
            }

            if (error) {
                return <ErrorMessage error={error} />;
            }

            return (
                <MonthCalendar
                    items={events}
                    onClickItem={handleClickItem}
                    withTotal
                />
            );
        };

        return <div class="TechnicianViewSchedule">{render()}</div>;
    },
};
