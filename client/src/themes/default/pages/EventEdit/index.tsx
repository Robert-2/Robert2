import './index.scss';
import axios from 'axios';
import config, { BillingMode } from '@/globals/config';
import HttpCode from 'status-code-enum';
import parseInteger from '@/utils/parseInteger';
import isTruthy from '@/utils/isTruthy';
import { defineComponent } from '@vue/composition-api';
import CriticalError, { ErrorType } from '@/themes/default/components/CriticalError';
import apiEvents from '@/stores/api/events';
import Page from '@/themes/default/components/Page';
import Loading from '@/themes/default/components/Loading';
import Stepper from '@/themes/default/components/Stepper';
import MiniSummary from './components/MiniSummary';
import STEPS_COMPONENTS from './steps';

import type { RawComponent } from 'vue';
import type { EventDetails } from '@/stores/api/events';
import type { Step } from '@/themes/default/components/Stepper';

type Data = (
    & {
        id: EventDetails['id'] | null,
        currentStep: number,
        isLoading: boolean,
        isDirty: boolean,
        criticalError: ErrorType | null,
        stepError: unknown | null,
    }
    & (
        | { isFetched: false, event: null }
        | { isFetched: true, event: EventDetails }
    )
);

/** Page d'édition d'un événement. */
const EventEdit = defineComponent({
    name: 'EventEdit',
    data(): Data {
        return {
            id: parseInteger(this.$route.params.id),
            currentStep: 1,
            isDirty: false,
            isLoading: false,
            isFetched: false,
            event: null,
            stepError: null,
            criticalError: null,
        };
    },
    computed: {
        isNew(): boolean {
            return this.id === null;
        },

        isBillable(): boolean | undefined {
            if (!this.isFetched) {
                return undefined;
            }

            return this.event !== null
                ? this.event.is_billable
                : config.billingMode !== BillingMode.NONE;
        },

        pageTitle(): string {
            const { $t: __, isNew, isFetched, event } = this;

            if (isNew) {
                return __('page.event-edit.title-create');
            }

            return isFetched
                ? __('page.event-edit.title', { title: event.title })
                : __('page.event-edit.title-simple');
        },

        steps(): Step[] {
            const { $t: __, event, isBillable } = this;
            const isPersisted = event !== null;

            return [
                {
                    id: 1,
                    name: __('page.event-edit.steps.informations.title'),
                    filled: true,
                },
                {
                    id: 2,
                    name: __('page.event-edit.steps.beneficiaries.title'),
                    reachable: isPersisted,
                    filled: (event?.beneficiaries ?? []).length > 0,
                },
                {
                    id: 3,
                    name: __('page.event-edit.steps.technicians.title'),
                    reachable: isPersisted,
                    filled: (event?.technicians ?? []).length > 0,
                },
                {
                    id: 4,
                    name: __('page.event-edit.steps.materials.title'),
                    reachable: isPersisted,
                    filled: (event?.materials ?? []).length > 0,
                },
                isBillable && {
                    id: 5,
                    name: __('page.event-edit.steps.billing.title'),
                    reachable: isPersisted,
                    filled: (
                        (event?.materials ?? []).length > 0 ||
                        ((event as EventDetails<true> | undefined)?.extras ?? []).length > 0
                    ),
                },
                {
                    id: 6,
                    name: __('page.event-edit.steps.summary.title'),
                    reachable: isPersisted,
                    filled: (
                        (event?.beneficiaries ?? []).length > 0 &&
                        (event?.materials ?? []).length > 0
                    ),
                },
            ].filter(isTruthy);
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

        handleUpdateEvent(event: EventDetails) {
            this.isLoading = false;
            this.event = event;
            this.isDirty = false;
        },

        handleStepDataChange() {
            this.isDirty = true;
        },

        handleStepDataReset() {
            this.isDirty = false;
        },

        handleOpenStep(stepId: number) {
            this.currentStep = stepId;
            this.isDirty = false;
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
                const event = await apiEvents.one(id!);

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
                    console.error(`Error occurred while retrieving event #${this.id!} data`, error);
                    this.criticalError = ErrorType.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ErrorType.NOT_FOUND
                        : ErrorType.UNKNOWN;
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
            isDirty,
            isFetched,
            isLoading,
            criticalError,
            handleOpenStep,
            handleUpdateEvent,
            handleStepDataReset,
            handleStepDataChange,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="event-edit" title={pageTitle} centered>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        const renderStep = (): JSX.Element | null => {
            if (!isFetched) {
                return null;
            }

            const StepComponent: RawComponent | undefined = STEPS_COMPONENTS.get(currentStep);
            return StepComponent === undefined ? null : (
                <StepComponent
                    event={event}
                    onDataChange={handleStepDataChange}
                    onDataReset={handleStepDataReset}
                    onLoading={() => { this.isLoading = true; }}
                    onStopLoading={() => { this.isLoading = false; }}
                    onUpdateEvent={handleUpdateEvent}
                    onGoToStep={handleOpenStep}
                />
            );
        };

        return (
            <Page name="event-edit" title={pageTitle}>
                <div class="EventEdit">
                    <div class="EventEdit__sidebar">
                        <Stepper
                            steps={steps}
                            currentStep={currentStep}
                            onOpenStep={handleOpenStep}
                        />
                        <MiniSummary
                            event={event}
                            isDirty={isDirty}
                        />
                        {isLoading && <Loading />}
                    </div>
                    <div class="EventEdit__body">
                        {renderStep()}
                    </div>
                </div>
            </Page>
        );
    },
});

export default EventEdit;
