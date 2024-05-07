import './index.scss';
import DateTime from '@/utils/datetime';
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

import type { ComponentRef } from 'vue';
import type { PropType } from '@vue/composition-api';
import type { EventDetails as Event } from '@/stores/api/events';
import type { Estimate } from '@/stores/api/estimates';
import type { Invoice } from '@/stores/api/invoices';
import type { TabChangeEvent } from '@/themes/default/components/Tabs';

/* eslint-disable @typescript-eslint/prefer-enum-initializers */
enum TabIndex {
    INFOS,
    TECHNICIANS,
    MATERIALS,
    ESTIMATES,
    INVOICES,
    DOCUMENTS,
    NOTE,
    HISTORY,
}
/* eslint-enable @typescript-eslint/prefer-enum-initializers */

type Props = {
    /** L'id de l'événement pour laquelle on veut afficher la modale de détails.  */
    id: Event['id'],

    /**
     * L'index de l'onglet actif par défaut à l'ouverture.
     *
     * @default TabIndex.INFOS
     */
    defaultTabIndex?: TabIndex,

    /**
     * Fonction appelée lorsque l'événement liée à l'id passé a été mis à jour.
     *
     * @param event - L'événement, mise à jour.
     */
    onUpdated?(event: Event): void,

    /**
     * Fonction appelée lorsque l'événement liée à l'id passé a dupliqué.
     *
     * @param newEvent - Le nouvel événement.
     */
    onDuplicated?(newEvent: Event): void,

    /**
     * Fonction appelée lorsque l'événement liée à l'id passé a été supprimée.
     */
    onDeleted?(): void,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    event: Event | null,
    hasCriticalError: boolean,
    isFetched: boolean,
    now: DateTime,
};

/** Modale de détails d'un événement. */
const EventDetails = defineComponent({
    name: 'EventDetails',
    modal: {
        clickToClose: true,
    },
    props: {
        id: {
            type: Number as PropType<Required<Props>['id']>,
            required: true,
        },
        defaultTabIndex: {
            type: Number as PropType<Required<Props>['defaultTabIndex']>,
            default: TabIndex.INFOS,
            validator: (value: unknown) => (
                Object.values(TabIndex).includes(value as any)
            ),
        },
        onUpdated: {
            type: Function as PropType<Props['onUpdated']>,
            default: undefined,
        },
        onDuplicated: {
            type: Function as PropType<Props['onDuplicated']>,
            default: undefined,
        },
        onDeleted: {
            type: Function as PropType<Props['onDeleted']>,
            default: undefined,
        },
    },
    emits: ['close'],
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        event: null,
        hasCriticalError: false,
        isFetched: false,
        now: DateTime.now(),
    }),
    computed: {
        isEventPast(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.mobilization_period.isBefore(this.now);
        },

        showBilling(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.is_billable && this.hasMaterials;
        },

        hasEventTechnicians(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.technicians.length > 0;
        },

        hasMaterials(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.materials.length > 0;
        },

        hasMaterialsProblems(): boolean {
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
    },
    mounted() {
        this.fetchData();

        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = DateTime.now(); }, 60_000);
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

        async handleTabChange(event: TabChangeEvent) {
            if (event.prevIndex !== TabIndex.DOCUMENTS) {
                return;
            }

            const $documents = this.$refs.documents as ComponentRef<typeof Documents>;
            if (!$documents?.isUploading()) {
                return;
            }

            event.preventDefault();

            const { $t: __ } = this;
            const isConfirmed = await confirm({
                type: 'danger',
                text: __('confirm-cancel-upload-change-tab'),
            });
            if (!isConfirmed) {
                return;
            }

            event.executeDefault();
        },

        handleUpdated(event: Event) {
            this.event = event;

            const { onUpdated } = this.$props;
            if (onUpdated) {
                onUpdated(event);
            }
        },

        handleDuplicated(newEvent: Event) {
            const { onDuplicated } = this.$props;
            if (onDuplicated) {
                onDuplicated(newEvent);
            }

            this.$emit('close');
        },

        handleDeleted() {
            const { onDeleted } = this.$props;
            if (onDeleted) {
                onDeleted();
            }

            this.$emit('close');
        },

        handleInvoiceCreated(newInvoice: Invoice) {
            if (!this.event || !this.event.is_billable) {
                return;
            }
            this.event.invoices.unshift(newInvoice);
        },

        handleEstimateCreated(newEstimate: Estimate) {
            if (!this.event || !this.event.is_billable) {
                return;
            }
            this.event.estimates.unshift(newEstimate);
        },

        handleEstimateDeleted(estimateId: Estimate['id']) {
            if (!this.event || !this.event.is_billable) {
                return;
            }

            this.event.estimates = this.event.estimates.filter(
                (estimate: Estimate) => estimate.id !== estimateId,
            );
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
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error occurred while retrieving event details:`, error);
                this.hasCriticalError = true;
            } finally {
                this.isFetched = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            event,
            defaultTabIndex,
            isFetched,
            showBilling,
            hasEventTechnicians,
            hasMaterials,
            hasMaterialsProblems,
            hasCriticalError,
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
                <div class="EventDetails EventDetails--not-ready">
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
                    onSaved={handleUpdated}
                    onDeleted={handleDeleted}
                    onDuplicated={handleDuplicated}
                    onClose={handleClose}
                />
                <div class="EventDetails__content">
                    <Tabs defaultIndex={defaultTabIndex} onChange={handleTabChange}>
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
                            <Documents ref="documents" event={event} />
                        </Tab>
                        <Tab title={__('notes')} icon="clipboard:regular">
                            <Note event={event} onUpdated={handleUpdated} />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    },
});

export { TabIndex };
export default EventDetails;
