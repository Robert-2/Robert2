import './index.scss';
import EventDetails from '@/themes/default/modals/EventDetails';
import MonthCalendar from '@/themes/default/components/MonthCalendar';
import ErrorMessage from '@/themes/default/components/ErrorMessage';
import Loading from '@/themes/default/components/Loading';
import showModal from '@/utils/showModal';
import { formatTechnicianEvent } from './_utils';

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
            return this.technicianEvents.map(formatTechnicianEvent);
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

            return <MonthCalendar events={events} withTotal onClickItem={handleClickItem} />;
        };

        return <div class="TechnicianViewSchedule">{render()}</div>;
    },
};
