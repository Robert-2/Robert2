import './index.scss';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import apiEvents from '@/stores/api/events';
import Help from '@/themes/default/components/Help';
import Page from '@/themes/default/components/Page';
import EventStore from './EventStore';
import Breadcrumb from './components/Breadcrumb';
import MiniSummary from './components/MiniSummary';
import EventStep1 from './steps/1';
import EventStep2 from './steps/2';
import EventStep3 from './steps/3';
import EventStep4 from './steps/4';
import EventStep5 from './steps/5';

// @vue/component
const EventPage = defineComponent({
    name: 'Event',
    data() {
        const { $t: __ } = this;

        return {
            help: 'page.event-edit.help-edit',
            isFetched: false,
            error: null,
            isLoading: false,
            steps: [
                {
                    id: 1,
                    name: __('page.event-edit.event-informations'),
                    fields: ['title', 'start_date', 'end_date'],
                },
                {
                    id: 2,
                    name: __('page.event-edit.event-beneficiaries'),
                    fields: ['beneficiaries'],
                },
                {
                    id: 3,
                    name: __('page.event-edit.event-technicians'),
                    fields: ['technicians'],
                },
                {
                    id: 4,
                    name: __('page.event-edit.event-materials'),
                    fields: ['materials'],
                },
                {
                    id: 5,
                    name: __('page.event-edit.event-summary'),
                    fields: ['title', 'start_date', 'end_date', 'beneficiaries', 'materials'],
                },
            ],
            currentStep: 1,
            event: {
                id: this.$route.params.id || null,
                title: '',
                start_date: this.$route.query.atDate || '',
                end_date: this.$route.query.atDate || '',
                location: '',
                description: '',
                is_confirmed: false,
                is_billable: config.billingMode !== 'none',
                beneficiaries: [],
                technicians: [],
                materials: [],
            },
        };
    },
    computed: {
        isNew() {
            const { id } = this.event;
            return !id || id === 'new';
        },

        pageTitle() {
            const { $t: __, isNew, isFetched, event } = this;

            if (isNew) {
                return __('page.event-edit.title-create');
            }

            if (!isFetched || !event) {
                return __('page.event-edit.title-simple');
            }

            const { title } = event;
            return __('page.event-edit.title', { title });
        },
    },
    mounted() {
        this.fetch();
        EventStore.commit('reset');
    },
    methods: {
        async fetch() {
            if (this.isNew) {
                this.isFetched = true;
                return;
            }

            const { id } = this.event;
            this.isLoading = true;

            try {
                this.event = await apiEvents.one(id);
                this.help = 'page.event-edit.help-edit';
                EventStore.commit('init', this.event);
            } catch (error) {
                this.error = error;
            } finally {
                this.isFetched = true;
                this.isLoading = false;
            }
        },

        handleUpdateEvent(data) {
            this.help = { type: 'success', text: 'page.event-edit.saved' };
            this.error = null;
            this.isLoading = false;
            this.event = data;
            EventStore.commit('init', this.event);
        },

        handleOpenStep(stepId) {
            this.currentStep = stepId;
        },

        handleError(error) {
            this.error = error;
            this.isLoading = false;
        },
    },
    render() {
        const {
            pageTitle,
            event,
            steps,
            currentStep,
            handleUpdateEvent,
            handleOpenStep,
            handleError,
            help,
            error,
            isFetched,
            isLoading,
        } = this;

        const renderStep = () => {
            if (!isFetched) {
                return null;
            }

            switch (currentStep) {
                case 1:
                    return (
                        <EventStep1
                            event={event}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGotoStep={handleOpenStep}
                        />
                    );
                case 2:
                    return (
                        <EventStep2
                            event={event}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGotoStep={handleOpenStep}
                        />
                    );
                case 3:
                    return (
                        <EventStep3
                            event={event}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGotoStep={handleOpenStep}
                        />
                    );
                case 4:
                    return (
                        <EventStep4
                            event={event}
                            onLoading={() => { this.isLoading = true; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGotoStep={handleOpenStep}
                        />
                    );
                case 5:
                    return (
                        <EventStep5
                            event={event}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGotoStep={handleOpenStep}
                        />
                    );
                default:
                    return null;
            }
        };

        return (
            <Page ref="page" name="event-edit" title={pageTitle}>
                <div class="Event">
                    <div class="Event__sidebar">
                        <Breadcrumb
                            event={event}
                            steps={steps}
                            currentStep={currentStep}
                            onOpenStep={handleOpenStep}
                        />
                        <MiniSummary />
                        <div class="Event__sidebar__help">
                            <Help message={help} error={error} isLoading={isLoading} />
                        </div>
                    </div>
                    <div class="Event__body">
                        {renderStep()}
                    </div>
                </div>
            </Page>
        );
    },
});

export default EventPage;
