import './index.scss';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import apiEvents from '@/stores/api/events';
import Help from '@/themes/default/components/Help';
import Page from '@/themes/default/components/Page';
import Loading from '@/themes/default/components/Loading';
import Breadcrumb from './components/Breadcrumb';
import MiniSummary from './components/MiniSummary';
import EventStep1 from './steps/1';
import EventStep2 from './steps/2';
import EventStep3 from './steps/3';
import EventStep4 from './steps/4';
import EventStep5 from './steps/5';

/** Page de création d'un événement. */
const EventPage = defineComponent({
    name: 'Event',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            currentStep: 1,
            isFetched: false,
            isLoading: false,
            isDirty: false,
            criticalError: null,
            error: null,
            event: null,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },

        pageTitle() {
            const { $t: __, isNew, isFetched, event } = this;

            if (isNew) {
                return __('page.event-edit.title-create');
            }

            return isFetched
                ? __('page.event-edit.title', { title: event.title })
                : __('page.event-edit.title-simple');
        },

        steps() {
            const { $t: __ } = this;

            return [
                {
                    id: 1,
                    name: __('page.event-edit.event-informations'),
                    filled: () => true,
                },
                {
                    id: 2,
                    name: __('page.event-edit.event-beneficiaries'),
                    filled: (event) => (
                        event.beneficiaries.length > 0
                    ),
                },
                {
                    id: 3,
                    name: __('page.event-edit.event-technicians'),
                    filled: (event) => (
                        event.technicians.length > 0
                    ),
                },
                {
                    id: 4,
                    name: __('page.event-edit.event-materials'),
                    filled: (event) => (
                        event.materials.length > 0
                    ),
                },
                {
                    id: 5,
                    name: __('page.event-edit.event-summary'),
                    filled: (event) => (
                        event.beneficiaries.length > 0 &&
                        event.materials.length > 0
                    ),
                },
            ];
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleUpdateEvent(event) {
            this.isLoading = false;
            this.error = null;
            this.event = event;
            this.isDirty = false;
        },

        handleStepDataChange() {
            this.isDirty = true;
        },

        handleStepDataReset() {
            this.isDirty = false;
        },

        handleOpenStep(stepId) {
            this.currentStep = stepId;
            this.isDirty = false;
        },

        handleError(error) {
            this.error = error;
            this.isLoading = false;
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                this.isFetched = true;
                return;
            }

            const { $t: __, id } = this;
            this.isLoading = true;

            try {
                const event = await apiEvents.one(id);

                const isEditable = (
                    // - Un événement archivé n'est pas modifiable.
                    !event.is_archived &&

                    // - Un événement ne peut être modifié que si son inventaire de retour
                    //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
                    //   d'autant que le stock global a pu être impacté suite à cet inventaire).
                    !event.is_return_inventory_done
                );
                if (!isEditable) {
                    this.$toasted.error(__('page.event-edit.cannot-be-modified'));
                    this.$router.replace({ name: 'schedule' });
                    return;
                }

                this.event = event;
                this.isDirty = false;
                this.isFetched = true;
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while retrieving event #${this.id} data`, error);
                    this.criticalError = ERROR.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ERROR.NOT_FOUND
                        : ERROR.UNKNOWN;
                }
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            pageTitle,
            event,
            steps,
            currentStep,
            error,
            isDirty,
            isFetched,
            isLoading,
            handleError,
            criticalError,
            handleOpenStep,
            handleUpdateEvent,
            handleStepDataReset,
            handleStepDataChange,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page ref="page" name="event-edit" title={pageTitle} centered>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        const renderStep = () => {
            if (!isFetched) {
                return null;
            }

            switch (currentStep) {
                case 1: {
                    return (
                        <EventStep1
                            event={event}
                            onDataChange={handleStepDataChange}
                            onDataReset={handleStepDataReset}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGoToStep={handleOpenStep}
                        />
                    );
                }
                case 2: {
                    return (
                        <EventStep2
                            event={event}
                            onDataChange={handleStepDataChange}
                            onDataReset={handleStepDataReset}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGoToStep={handleOpenStep}
                        />
                    );
                }
                case 3: {
                    return (
                        <EventStep3
                            event={event}
                            onDataChange={handleStepDataChange}
                            onDataReset={handleStepDataReset}
                            onLoading={() => { this.isLoading = true; }}
                            onStopLoading={() => { this.isLoading = false; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGoToStep={handleOpenStep}
                        />
                    );
                }
                case 4: {
                    return (
                        <EventStep4
                            event={event}
                            onDataChange={handleStepDataChange}
                            onDataReset={handleStepDataReset}
                            onLoading={() => { this.isLoading = true; }}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGoToStep={handleOpenStep}
                        />
                    );
                }
                case 5: {
                    return (
                        <EventStep5
                            event={event}
                            onError={handleError}
                            onUpdateEvent={handleUpdateEvent}
                            onGoToStep={handleOpenStep}
                        />
                    );
                }
                default: {
                    return null;
                }
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
                        <MiniSummary
                            event={event}
                            isDirty={isDirty}
                        />
                        <div class="Event__sidebar__help">
                            <Help error={error} isLoading={isLoading} />
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
