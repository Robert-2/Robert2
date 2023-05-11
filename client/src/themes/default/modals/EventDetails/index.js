import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import { confirm } from '@/utils/alert';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import apiEvents from '@/stores/api/events';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Button from '@/themes/default/components/Button';
import Header from './components/Header';
import Infos from './tabs/Infos';
import Technicians from './tabs/Technicians';
import Materials from './tabs/Materials';
import Estimates from './tabs/Estimates';
import Invoices from './tabs/Invoices';
import Documents from './tabs/Documents';
import Note from './tabs/Note';

const TABS = [
    'infos',
    'technicians',
    'materials',
    'estimates',
    'invoices',
    'documents',
    'note',
];

// @vue/component
const EventDetails = {
    name: 'EventDetails',
    modal: {
        clickToClose: true,
    },
    props: {
        id: { type: Number, required: true },
        openedTab: { type: String, default: 'infos' },
        onUpdateEvent: { type: Function, default: undefined },
        onDuplicateEvent: { type: Function, default: undefined },
    },
    data: () => ({
        isFetched: false,
        hasCriticalError: false,
        event: null,
        now: Date.now(),
    }),
    computed: {
        openedTabIndex() {
            const index = TABS.indexOf(this.openedTab);
            return index < 0 ? 0 : index;
        },

        isEventPast() {
            if (!this.event) {
                return false;
            }
            return moment(this.event.end_date).isBefore(this.now, 'day');
        },

        hasMaterials() {
            if (!this.event) {
                return false;
            }
            return this.event.materials.length > 0;
        },

        showBilling() {
            if (!this.event) {
                return false;
            }
            return this.event.is_billable && this.hasMaterials;
        },

        hasMaterialsProblems() {
            if (!this.event) {
                return false;
            }

            const { event, isEventPast } = this;
            const {
                has_missing_materials: hasMissingMaterials,
                has_not_returned_materials: hasNotReturnedMaterials,
            } = event;

            // - Si l'événement est en cours ou à venir et qu'il manque du matériel.
            if (!isEventPast && hasMissingMaterials) {
                return true;
            }

            // - Si l'événement est passé et qu'il a du matériel manquant.
            if (isEventPast && hasNotReturnedMaterials) {
                return true;
            }

            return false;
        },

        hasEventTechnicians() {
            if (!this.event) {
                return false;
            }
            return this.event.technicians.length > 0;
        },
    },
    mounted() {
        this.fetchData();

        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleTabChange(event) {
            if (event.prevIndex !== TABS.indexOf('documents')) {
                return;
            }

            const { documentsRef } = this.$refs;
            if (!documentsRef?.isUploading()) {
                return;
            }

            event.preventDefault();

            const { $t: __ } = this;
            const isConfirmed = await confirm({
                text: __('confirm-cancel-upload-change-tab'),
                type: 'danger',
            });
            if (!isConfirmed) {
                return;
            }

            event.executeDefault();
        },

        handleUpdated(event) {
            this.event = event;

            const { onUpdated } = this.$props;
            if (onUpdated) {
                onUpdated(event);
            }
        },

        handleDuplicated(newEvent) {
            const { onDuplicated } = this.$props;
            if (onDuplicated) {
                onDuplicated(newEvent);
            }

            this.handleClose();
        },

        handleDeleted() {
            this.$emit('close');
        },

        handleInvoiceCreated(newInvoice) {
            if (!this.event || !this.event.is_billable) {
                return;
            }
            this.event.invoices.unshift(newInvoice);
        },

        handleEstimateCreated(newEstimate) {
            if (!this.event || !this.event.is_billable) {
                return;
            }
            this.event.estimates.unshift(newEstimate);
        },

        handleEstimateDeleted(estimateId) {
            const newEstimatesList = this.event.estimates.filter(
                (estimate) => estimate.id !== estimateId,
            );
            this.event.estimates = newEstimatesList;
        },

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                this.event = await apiEvents.one(this.id);
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetched = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            isFetched,
            hasCriticalError,
            event,
            openedTabIndex,
            showBilling,
            hasEventTechnicians,
            hasMaterials,
            hasMaterialsProblems,
            handleUpdated,
            handleTabChange,
            handleDuplicated,
            handleDeleted,
            handleEstimateCreated,
            handleEstimateDeleted,
            handleInvoiceCreated,
            handleClose,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <div class="EventDetails">
                    <div class="EventDetails__close">
                        <Button
                            type="close"
                            class="EventDetails__close__button"
                            onClick={handleClose}
                        />
                    </div>
                    <div class="EventDetails__content">
                        {hasCriticalError ? <CriticalError /> : <Loading class="EventDetails__loading" />}
                    </div>
                </div>
            );
        }

        return (
            <div class="EventDetails">
                <Header
                    event={event}
                    onClose={handleClose}
                    onSaved={handleUpdated}
                    onDeleted={handleDeleted}
                    onDuplicated={handleDuplicated}
                />
                <div class="EventDetails__content">
                    <Tabs
                        defaultIndex={openedTabIndex}
                        onChange={handleTabChange}
                    >
                        <Tab title={__('informations')} icon="info-circle">
                            <Infos event={event} />
                        </Tab>
                        <Tab
                            title={__('technicians')}
                            icon="people-carry"
                            disabled={!hasEventTechnicians}
                        >
                            <Technicians event={event} />
                        </Tab>
                        <Tab
                            title={__('material')}
                            icon="box"
                            disabled={!hasMaterials}
                            warning={hasMaterialsProblems}
                        >
                            <Materials event={event} />
                        </Tab>
                        {showBilling && (
                            <Tab title={__('estimates')} icon="file-signature">
                                <Estimates
                                    event={event}
                                    onCreated={handleEstimateCreated}
                                    onDeleted={handleEstimateDeleted}
                                />
                            </Tab>
                        )}
                        {showBilling && (
                            <Tab title={__('invoice')} icon="file-invoice-dollar">
                                <Invoices
                                    event={event}
                                    onCreated={handleInvoiceCreated}
                                />
                            </Tab>
                        )}
                        <Tab title={__('documents')} icon="file-pdf">
                            <Documents ref="documentsRef" event={event} />
                        </Tab>
                        <Tab title={__('notes')} icon="clipboard:regular">
                            <Note event={event} onUpdated={handleUpdated} />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    },
};

export default defineComponent(EventDetails);
