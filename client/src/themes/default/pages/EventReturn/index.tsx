import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { ApiErrorCode } from '@/stores/api/@codes';
import { ReturnInventoryMode } from '@/stores/api/settings';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import Page from '@/themes/default/components/Page';
import Loading from '@/themes/default/components/Loading';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Unavailable, { UnavailabilityReason } from './components/Unavailable';
import Inventory, { InventoryErrorsSchema, DisplayGroup } from './components/Inventory';
import Header from './components/Header';
import Footer from './components/Footer';

import type { ComponentRef } from 'vue';
import type { Settings } from '@/stores/api/settings';
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
        inventory: InventoryData,
        displayGroup: DisplayGroup,
        criticalError: string | null,
        isSaved: boolean,
        isSaving: boolean,
        inventoryErrors: InventoryMaterialError[] | null,
        now: number,
    }
    & (
        | { isFetched: false, event: null }
        | { isFetched: true, event: Event }
    )
);

/** Page d'inventaire de retour d'un événement. */
const EventReturn = defineComponent({
    name: 'EventReturn',
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data(): Data {
        return {
            id: parseInt(this.$route.params.id, 10),
            event: null,
            inventory: [],
            displayGroup: DisplayGroup.CATEGORIES,
            isFetched: false,
            isSaved: false,
            isSaving: false,
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

        mode(): Settings['returnInventory']['mode'] {
            return this.$store.state.settings.returnInventory.mode;
        },

        isInventoryPeriodOpen(): boolean {
            if (!this.event) {
                return false;
            }

            // NOTE: C'est la date de début d'événement qui fait foi pour permettre
            //       le retour, pas la date de début de mobilisation.
            //       (sans quoi on pourrait faire le retour d'un événement avant même
            //       qu'il ait réellement commencé, ce qui n'a pas de sens).
            const startDate = moment(this.event.start_date);
            return startDate.isSameOrBefore(this.now, 'day');
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
            return !!this.event.is_return_inventory_done;
        },

        isViewable(): boolean {
            if (!this.event || this.isArchived) {
                return false;
            }

            // - Si l'inventaire n'est pas encore disponible ou que l'événement ne contient
            //   pas de matériel, pas d'inventaire possible.
            if (!this.isInventoryPeriodOpen || !this.hasMaterials) {
                return false;
            }

            // - Si l'inventaire est déjà effectué, il est visualisable, sinon
            //   l'événement ne doit pas contenir de pénurie.
            return this.isDone || !this.hasMaterialShortage;
        },

        isEditable(): boolean {
            // - L'inventaire doit-être visualisable et ne pas être déjà terminé.
            return this.isViewable && !this.isDone;
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
            if (!this.event || !this.isEditable) {
                return false;
            }

            // FIXME: Cette condition devra être supprimée lorsque les dates de
            //        mobilisation auront été implémentées.
            const endDate = moment(this.event.end_date);
            return endDate.isSameOrBefore(this.now, 'day');
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

            const index = this.inventory.findIndex(({ id: _id }: InventoryMaterial) => id === _id);
            if (index < 0) {
                return;
            }
            this.$set(this.inventory, index, { id, ...materialInventory });
            this.isSaved = false;
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

            const hasBroken = this.inventory.some(
                ({ broken }: InventoryMaterial) => broken > 0,
            );

            const isConfirmed = await confirm({
                title: __('confirm-terminate-title'),
                confirmButtonText: __('global.terminate-inventory'),
                text: hasBroken
                    ? __('confirm-terminate-text-with-broken')
                    : __('confirm-terminate-text'),
            });
            if (!isConfirmed) {
                return;
            }

            await this.save(true);
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
                    ? apiEvents.finishReturnInventory(this.id, inventory)
                    : apiEvents.updateReturnInventory(this.id, inventory)
            );

            try {
                this.setEvent(await doRequest());

                this.inventoryErrors = null;
                this.$toasted.success(__('saved'));
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error occurred while saving the event #${this.id} return inventory`, error);
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

            const { is_return_inventory_started: isReturnInventoryStarted } = event;
            this.isSaved = isReturnInventoryStarted;

            const getActualQuantity = (eventMaterial: EventMaterial): number => (
                (!isReturnInventoryStarted && this.mode === ReturnInventoryMode.START_FULL)
                    ? eventMaterial.pivot.quantity
                    : eventMaterial.pivot.quantity_returned ?? 0
            );

            this.inventory = event.materials.map(
                (eventMaterial: EventMaterial): InventoryMaterial => ({
                    id: eventMaterial.id,
                    actual: getActualQuantity(eventMaterial),
                    broken: eventMaterial.pivot.quantity_returned_broken ?? 0,
                }),
            );
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.event-return.${key}`
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
            isDone,
            isSaving,
            isArchived,
            isEditable,
            isViewable,
            canTerminate,
            hasMaterials,
            hasMaterialShortage,
            isInventoryPeriodOpen,
            handleSave,
            handleTerminate,
            handleChangeInventory,
            handleChangeDisplayGroup,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="event-return" title={pageTitle}>
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
            if (!isDone && hasMaterialShortage) {
                return (
                    <Unavailable
                        event={event}
                        reason={UnavailabilityReason.MATERIAL_SHORTAGE}
                    />
                );
            }

            return (
                <Inventory
                    event={event}
                    inventory={inventory}
                    errors={inventoryErrors}
                    displayGroup={displayGroup}
                    canTerminate={canTerminate}
                    onChange={handleChangeInventory}
                />
            );
        };

        return (
            <Page
                ref="page"
                name="event-return"
                title={pageTitle}
                hasValidationError={!!inventoryErrors}
            >
                <div class="EventReturn">
                    <Header
                        class="EventReturn__header"
                        event={event}
                        displayGroup={displayGroup}
                        showDisplayGroupSelector={isViewable}
                        onDisplayGroupChange={handleChangeDisplayGroup}
                    />
                    <div class="EventReturn__body">
                        {renderContent()}
                    </div>
                    {isEditable && (
                        <Footer
                            class="EventReturn__footer"
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

export default EventReturn;
