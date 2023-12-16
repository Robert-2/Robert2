import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiEvents from '@/stores/api/events';
import { BookingEntity } from '@/stores/api/bookings';
import { confirm } from '@/utils/alert';
import showModal from '@/utils/showModal';
import UpdateBookingMaterials from '@/themes/default/modals/UpdateBookingMaterials';
import Page from '@/themes/default/components/Page';
import Loading from '@/themes/default/components/Loading';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Unavailable, { UnavailabilityReason } from './components/Unavailable';
import Inventory, { InventoryErrorsSchema, DisplayGroup } from './components/Inventory';
import Header from './components/Header';
import Footer from './components/Footer';

import type { Moment } from 'moment';
import type { ComponentRef } from 'vue';
import type {
    Event,
    EventMaterial,
} from '@/stores/api/events';
import type {
    InventoryData,
    InventoryMaterial,
    InventoryMaterialData,
    InventoryMaterialError,
} from './components/Inventory';

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = (
    & {
        id: Event['id'],
        inventoryRaw: InventoryData,
        displayGroup: DisplayGroup,
        criticalError: string | null,
        isDirtyRaw: boolean,
        isSaving: boolean,
        isUpdatingMaterial: boolean,
        inventoryErrors: InventoryMaterialError[] | null,
        now: number,
    }
    & (
        | { isFetched: false, event: null }
        | { isFetched: true, event: Event }
    )
);

/** Page d'inventaire de départ d'un événement. */
const EventDeparture = defineComponent({
    name: 'EventDeparture',
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data(): Data {
        return {
            id: parseInt(this.$route.params.id, 10),
            event: null,
            inventoryRaw: [],
            displayGroup: DisplayGroup.CATEGORIES,
            isFetched: false,
            isDirtyRaw: false,
            isSaving: false,
            isUpdatingMaterial: false,
            criticalError: null,
            inventoryErrors: null,
            now: Date.now(),
        };
    },
    computed: {
        pageTitle(): string {
            const { __, isFetched, event } = this;

            return isFetched
                ? __('title', { name: event.title })
                : __('title-simple');
        },

        inventoryPeriodStart(): Moment | undefined {
            if (!this.event) {
                return undefined;
            }

            // FIXME: Lorsque les dates de mobilisation auront été implémentées,
            //        on devra pouvoir commencer l'inventaire de départ quand on
            //        veut avant le début de l'événement et cela "bougera" la date
            //        de début de mobilisation à cette date.
            return moment(this.event.start_date).subtract(1, 'days');
        },

        inventory(): InventoryData {
            if (!this.isDone) {
                return this.inventoryRaw;
            }

            return this.event!.materials.map(
                (eventMaterial: EventMaterial): InventoryMaterial => ({
                    id: eventMaterial.id,
                    actual: eventMaterial.pivot.quantity,
                    comment: eventMaterial.pivot.departure_comment ?? null,
                }),
            );
        },

        isDirty(): boolean {
            return !this.isDone ? this.isDirtyRaw : false;
        },

        isInventoryPeriodOpen(): boolean {
            if (this.inventoryPeriodStart === undefined) {
                return false;
            }
            return this.inventoryPeriodStart.isSameOrBefore(this.now, 'day');
        },

        isInventoryPeriodClosed(): boolean {
            if (!this.event) {
                return true;
            }

            // - Si l'inventaire de retour est fait, la période de réalisation
            //   des inventaires de départ est forcément fermée.
            if (this.event.is_return_inventory_done) {
                return true;
            }

            // NOTE 1: C'est la date de début d'événement qui fait foi pour permettre
            //         de calculer la période d'ouverture de l'inventaire de départ, pas
            //         la date de début de mobilisation. La date de début de mobilisation
            //         est la résultante de cet inventaire de départ.
            // NOTE 2: On laisse un délai de 1 jour après la date de départ pour faire
            //         l'inventaire de départ (mais en ne dépassant jamais la date de
            //         fin d'événement).
            // FIXME: Lorsque les dates de mobilisation auront été implémentées, il ne
            //        faudra permettre les inventaires de départ que jusqu'à la date de
            //        début de l'événement.
            let inventoryPeriodCloseDate = moment(this.event.start_date).add(1, 'days');
            if (inventoryPeriodCloseDate.isAfter(this.event.end_date)) {
                inventoryPeriodCloseDate = moment(this.event.end_date);
            }
            return inventoryPeriodCloseDate.isBefore(this.now);
        },

        hasMaterials(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.materials.length > 0;
        },

        hasMaterialShortage(): boolean {
            if (!this.event) {
                return false;
            }
            return this.event.has_missing_materials === true;
        },

        isArchived(): boolean {
            if (!this.event) {
                return false;
            }
            return !!this.event.is_archived;
        },

        isDone(): boolean {
            if (!this.event) {
                return false;
            }
            return !!this.event.is_departure_inventory_done;
        },

        isViewable(): boolean {
            if (!this.event || this.isArchived) {
                return false;
            }

            // - Si l'inventaire n'est pas encore disponible ou que l'événement
            //   ne contient pas de matériel, pas d'inventaire possible.
            if (!this.isInventoryPeriodOpen || !this.hasMaterials) {
                return false;
            }

            // - Sinon, si l'inventaire est effectué, il est visualisable.
            if (this.isDone) {
                return true;
            }

            // FIXME: À re-activer lorsque les inventaires de retour terminés
            //        rendront disponibles les stocks utilisés dans l'événement
            //        (en bougeant la date de fin de mobilisation) OU quand la
            //        gestion horaire aura été implémentée.
            //        Sans ça, pour les événements qui partent juste après un autre
            //        dont l'inventaire de retour a été terminé, sur un même jour,
            //        on est bloqué car le système pense qu'il y a une pénurie.
            // // - Si l'inventaire n'est pas déjà effectué, la période d'inventaire
            // //   doit être encore en cours et la réservation ne doit pas contenir
            // //   de pénurie.
            // return !this.isInventoryPeriodClosed && !this.hasMaterialShortage;
            return !this.isInventoryPeriodClosed;
        },

        isEditable(): boolean {
            // - L'inventaire doit-être visualisable et ne pas être déjà terminé.
            return this.isViewable && !this.isDone;
        },

        isMaterialEditable(): boolean {
            if (!this.event || !this.isEditable) {
                return false;
            }

            return (
                // - Un événement archivé n'est pas modifiable.
                !this.event.is_archived &&

                // - Un événement ne peut être modifié que si son inventaire de retour
                //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
                //   d'autant que le stock global a pu être impacté suite à cet inventaire).
                !this.event.is_return_inventory_done
            );
        },

        isComplete(): boolean {
            if (!this.event) {
                return false;
            }

            const { event, inventory } = this;
            return event.materials.every(({ id: materialId, pivot }: EventMaterial) => {
                const quantities = inventory.find(({ id }: InventoryMaterial) => id === materialId);
                return quantities ? quantities.actual === pivot.quantity : false;
            });
        },

        canTerminate(): boolean {
            return this.isEditable && this.isComplete;
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

        handleChangeInventory(id: EventMaterial['id'], materialInventory: InventoryMaterialData) {
            if (!this.isEditable) {
                return;
            }

            const index = this.inventoryRaw.findIndex(({ id: _id }: InventoryMaterial) => id === _id);
            if (index < 0) {
                return;
            }
            this.$set(this.inventoryRaw, index, { id, ...materialInventory });
            this.isDirtyRaw = true;
        },

        handleChangeDisplayGroup(group: DisplayGroup) {
            this.displayGroup = group;
        },

        handleSave() {
            if (!this.isEditable) {
                return;
            }
            this.save();
        },

        async handleTerminate() {
            const { __ } = this;

            if (!this.canTerminate) {
                return;
            }

            // FIXME: Lorsque les périodes de mobilisation auront été implémentées,
            //        si l'inventaire est fait avant la date de début de mobilisation,
            //        adapter celle-ci pour coiler à la date de réalisation de l'inventaire
            //        de départ et donc le spécifier dans cette modale.
            //        (e.g. "Ceci va modifier la date de début de mobilisation du matériel")
            const isConfirmed = await confirm({
                title: __('confirm-terminate-title'),
                confirmButtonText: __('global.terminate-inventory'),
                text: __('confirm-terminate-text'),
            });
            if (!isConfirmed) {
                return;
            }

            await this.save(true);
        },

        async handleUpdateMaterialClick() {
            if (this.isSaving || !this.isMaterialEditable) {
                return;
            }
            const { __ } = this;

            if (this.isDirty) {
                const isConfirmed = await confirm({
                    title: __('confirm-unsaved-edit-material-title'),
                    confirmButtonText: __('global.confirm'),
                    text: __('confirm-unsaved-edit-material-text'),
                });
                if (!isConfirmed) {
                    return;
                }
            }

            this.isUpdatingMaterial = true;

            const booking = { ...this.event, entity: BookingEntity.EVENT };
            await showModal(this.$modal, UpdateBookingMaterials, { booking });

            this.isUpdatingMaterial = false;
            this.fetchData();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                this.setEvent(await apiEvents.one(this.id));
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
            }
        },

        async save(finish: boolean = false) {
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            const { __, inventory } = this;

            const doRequest = (): Promise<Event> => (
                finish
                    ? apiEvents.finishDepartureInventory(this.id, inventory)
                    : apiEvents.updateDepartureInventory(this.id, inventory)
            );

            try {
                this.setEvent(await doRequest());

                this.inventoryErrors = null;
                this.$toasted.success(__('saved'));
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while saving the event #${this.id} departure inventory`, error);
                    this.$toasted.error(__('global.errors.unexpected-while-saving'));
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        const inventoryErrors = InventoryErrorsSchema.safeParse(details);
                        if (inventoryErrors.success) {
                            this.inventoryErrors = inventoryErrors.data;
                            (this.$refs.page as ComponentRef<typeof Page>)?.scrollToTop();
                            return;
                        }
                    }
                    this.$toasted.error(__('global.errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },

        setEvent(event: Event) {
            this.event = event;

            this.isDirtyRaw = false;
            this.inventoryRaw = event.materials.map(
                (eventMaterial: EventMaterial): InventoryMaterial => ({
                    id: eventMaterial.id,
                    actual: eventMaterial.pivot.quantity_departed ?? 0,
                    comment: eventMaterial.pivot.departure_comment ?? null,
                }),
            );
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.event-departure.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            event,
            inventory,
            displayGroup,
            pageTitle,
            isFetched,
            criticalError,
            inventoryErrors,
            inventoryPeriodStart,
            isDone,
            isSaving,
            isViewable,
            isEditable,
            isMaterialEditable,
            isArchived,
            canTerminate,
            hasMaterials,
            // hasMaterialShortage,
            isInventoryPeriodOpen,
            isInventoryPeriodClosed,
            isUpdatingMaterial,
            handleSave,
            handleTerminate,
            handleChangeInventory,
            handleChangeDisplayGroup,
            handleUpdateMaterialClick,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="event-departure" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        const renderContent = (): JSX.Element => {
            if (isArchived) {
                return (
                    <Unavailable
                        event={event}
                        reason={UnavailabilityReason.ARCHIVED}
                    />
                );
            }
            if (!isInventoryPeriodOpen) {
                return (
                    <Unavailable
                        event={event}
                        reason={UnavailabilityReason.TOO_SOON}
                        variables={{ inventoryPeriodStart }}
                    />
                );
            }
            if (!hasMaterials) {
                return (
                    <Unavailable
                        event={event}
                        reason={UnavailabilityReason.NO_MATERIALS}
                    />
                );
            }
            // FIXME: À re-activer lorsque les inventaires de retour terminés
            //        rendront disponibles les stocks utilisés dans l'événement
            //        (en bougeant la date de fin de mobilisation) OU quand la
            //        gestion horaire aura été implémentée.
            //        Sans ça, pour les événements qui partent juste après un autre
            //        dont l'inventaire de retour a été terminé, sur un même jour,
            //        on est bloqué car le système pense qu'il y a une pénurie.
            // if (!isDone && hasMaterialShortage) {
            //     return (
            //         <Unavailable
            //             event={event}
            //             reason={UnavailabilityReason.MATERIAL_SHORTAGE}
            //         />
            //     );
            // }
            if (!isDone && isInventoryPeriodClosed) {
                return (
                    <Unavailable
                        event={event}
                        reason={UnavailabilityReason.TOO_LATE}
                    />
                );
            }

            return (
                <Inventory
                    event={event}
                    inventory={inventory}
                    errors={inventoryErrors}
                    displayGroup={displayGroup}
                    onChange={handleChangeInventory}
                    paused={isUpdatingMaterial}
                />
            );
        };

        return (
            <Page
                ref="page"
                name="event-departure"
                title={pageTitle}
                hasValidationError={!!inventoryErrors}
            >
                <div class="EventDeparture">
                    <Header
                        class="EventDeparture__header"
                        event={event}
                        displayGroup={displayGroup}
                        showDisplayGroupSelector={isViewable}
                        showMaterialEditAction={isMaterialEditable}
                        onDisplayGroupChange={handleChangeDisplayGroup}
                        onUpdateMaterialClick={handleUpdateMaterialClick}
                    />
                    <div class="EventDeparture__body">
                        {renderContent()}
                    </div>
                    {isEditable && (
                        <Footer
                            class="EventDeparture__footer"
                            event={event}
                            isSaving={isSaving}
                            canTerminate={canTerminate}
                            onSave={handleSave}
                            onTerminate={handleTerminate}
                        />
                    )}
                </div>
            </Page>
        );
    },
});

export default EventDeparture;
