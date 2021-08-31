import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/globals/config';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import formatTimelineEvent from '@/utils/timeline-event/format';
import Header from './Header';
import Infos from './Infos';
import Technicians from './Technicians';
import Materials from './Materials';
import Estimates from './Estimates';
import Billing from './Billing';

const TABS = [
    'infos',
    'technicians',
    'materials',
    'estimates',
    'bills',
];

// @vue/component
export default {
    name: 'EventDetails',
    props: {
        eventId: { type: Number, required: true },
        openedTab: { type: String, default: 'infos' },
        onUpdateEvent: { type: Function, default: undefined },
        onDuplicateEvent: { type: Function, default: undefined },
    },
    data: () => ({
        event: null,
        showBilling: Config.billingMode !== 'none',
        isLoading: false,
        error: null,
    }),
    computed: {
        openedTabIndex() {
            const index = TABS.findIndex((tabName) => tabName === this.openedTab);
            return index < 0 ? 0 : index;
        },

        hasEventTechnicians() {
            return this.event?.technicians?.length > 0;
        },

        hasMaterials() {
            return this.event?.materials?.length > 0;
        },

        hasMaterialsProblems() {
            return (
                (this.event?.hasMissingMaterials && !this.event?.is_return_inventory_done) ||
                this.event?.hasNotReturnedMaterials
            );
        },
    },
    mounted() {
        this.getEvent();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleEstimateCreated(newEstimate) {
            this.event.estimates.unshift(newEstimate);
        },

        handleEstimateDeleted(estimateId) {
            const newEstimatesList = this.event.estimates.filter(
                (estimate) => estimate.id !== estimateId,
            );
            this.event.estimates = newEstimatesList;
        },

        handleBillCreated(newBill) {
            this.event.bills.unshift(newBill);
        },

        handleUpdateEvent(newData) {
            this.setEventData(newData);

            const { onUpdateEvent } = this.$props;
            if (onUpdateEvent) {
                onUpdateEvent(newData);
            }
        },

        handleDuplicateEvent(newEvent) {
            const { onDuplicateEvent } = this.$props;
            if (onDuplicateEvent) {
                onDuplicateEvent(newEvent);
            }
            this.handleClose();
        },

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async getEvent() {
            try {
                this.error = null;
                this.isLoading = true;

                const { eventId } = this.$props;
                const url = `events/${eventId}`;

                const { data } = await this.$http.get(url);
                this.setEventData(data);
            } catch (error) {
                this.error = error;
            } finally {
                this.isLoading = false;
            }
        },

        setEventData(data) {
            this.event = {
                ...formatTimelineEvent(data),
                ...data,
            };
        },
    },
    render() {
        const {
            $t: __,
            event,
            openedTabIndex,
            showBilling,
            hasEventTechnicians,
            hasMaterials,
            hasMaterialsProblems,
            handleClose,
            isLoading,
            error,
            handleEstimateCreated,
            handleEstimateDeleted,
            handleBillCreated,
            handleUpdateEvent,
            handleDuplicateEvent,
        } = this;

        return (
            <div class="EventDetails">
                {isLoading && <Loading />}
                {!!(!isLoading && event) && (
                    <section class="EventDetails__content">
                        <Header
                            event={event}
                            onClose={handleClose}
                            onSaved={handleUpdateEvent}
                            onDeleted={handleClose}
                            onError={(_error) => {
                                this.error = _error;
                            }}
                            onDuplicated={handleDuplicateEvent}
                        />
                        <div class="EventDetails__content__body">
                            <Tabs defaultIndex={openedTabIndex}>
                                <Tab title={<span><i class="fas fa-info-circle" /> {__('informations')}</span>}>
                                    <Infos event={event} />
                                </Tab>
                                <Tab
                                    disabled={!hasEventTechnicians}
                                    title={<span><i class="fas fa-people-carry" /> {__('technicians')}</span>}
                                >
                                    <Technicians event={event} />
                                </Tab>
                                <Tab
                                    disabled={!hasMaterials}
                                    title={(
                                        <span>
                                            <i class="fas fa-box" /> {__('material')}
                                            {hasMaterialsProblems && (
                                                <i class="fas fa-exclamation-triangle" />
                                            )}
                                        </span>
                                    )}
                                >
                                    <Materials event={event} />
                                </Tab>
                                {showBilling && (
                                    <Tab
                                        disabled={!hasMaterials}
                                        title={<span><i class="fas fa-file-signature" /> {__('estimates')}</span>}
                                    >
                                        <Estimates
                                            event={event}
                                            onCreateEstimate={handleEstimateCreated}
                                            onDeleteEstimate={handleEstimateDeleted}
                                            onBillingEnabled={handleUpdateEvent}
                                        />
                                    </Tab>
                                )}
                                {showBilling && (
                                    <Tab
                                        disabled={!hasMaterials}
                                        title={<span><i class="fas fa-file-invoice-dollar" /> {__('bill')}</span>}
                                    >
                                        <Billing
                                            event={event}
                                            onCreateBill={handleBillCreated}
                                            onBillingEnabled={handleUpdateEvent}
                                        />
                                    </Tab>
                                )}
                            </Tabs>
                            {!hasMaterials && (
                                <div class="EventDetails__materials-empty">
                                    <p>
                                        <i class="fas fa-exclamation-triangle" />
                                        {__('page-events.warning-no-material')}
                                    </p>
                                    {!event.isPast && (
                                        <router-link to={`/events/${event.id}`} class="button info">
                                            <i class="fas fa-edit" /> {__('page-events.edit-event')}
                                        </router-link>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {error && <ErrorMessage error={error} />}
            </div>
        );
    },
};
