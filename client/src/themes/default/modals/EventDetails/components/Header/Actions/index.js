import './index.scss';
import { defineComponent } from '@vue/composition-api';
import moment from 'moment';
import axios from 'axios';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';
import showModal from '@/utils/showModal';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiEvents from '@/stores/api/events';
import DuplicateEvent from '@/themes/default/modals/DuplicateEvent';
import Dropdown from '@/themes/default/components/Dropdown';
import Button from '@/themes/default/components/Button';
import { Group } from '@/stores/api/groups';
import ButtonDropdown from '@/themes/default/components/ButtonDropdown';

// @vue/component
const EventDetailsHeaderActions = defineComponent({
    name: 'EventDetailsHeaderActions',
    props: {
        event: { type: Object, required: true },
    },
    emits: ['saved', 'deleted', 'duplicated'],
    data: () => ({
        now: Date.now(),
        isConfirming: false,
        isArchiving: false,
        isDeleting: false,
    }),
    computed: {
        eventSummaryPdfUrl() {
            const { id } = this.event ?? { id: null };
            return `${config.baseUrl}/events/${id}/pdf`;
        },

        hasStarted() {
            const startDate = moment(this.event.start_date);
            return startDate.isSameOrBefore(this.now, 'day');
        },

        hasMaterials() {
            return this.event.materials.length > 0;
        },

        hasMaterialShortage() {
            return this.event.has_missing_materials === true;
        },

        isEventPast() {
            const endDate = moment(this.event.end_date);
            return endDate.isBefore(this.now, 'day');
        },

        isConfirmed() {
            return this.event.is_confirmed;
        },

        isConfirmTogglable() {
            return !this.isEventPast && (this.isConfirmed || this.hasMaterials);
        },

        isArchived() {
            return this.event.is_archived;
        },

        isArchivable() {
            return this.isEventPast && this.isReturnInventoryDone;
        },

        isDepartureInventoryPeriodOpen() {
            // FIXME: Lorsque les dates de mobilisation auront été implémentées,
            //        on devra pouvoir commencer l'inventaire de départ quand on
            //        veut avant le début de l'événement et cela "bougera" la date
            //        de début de mobilisation à cette date.
            const inventoryPeriodStart = moment(this.event.start_date).subtract(1, 'days');
            return inventoryPeriodStart.isSameOrBefore(this.now, 'day');
        },

        isDepartureInventoryPeriodClosed() {
            // - Si l'inventaire de retour est fait, la période de réalisation
            //   des inventaires de départ est forcément fermée.
            if (this.isReturnInventoryDone) {
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

        isDepartureInventoryDone() {
            return this.event.is_departure_inventory_done;
        },

        isReturnInventoryPeriodOpen() {
            // NOTE: C'est la date de début d'événement qui fait foi pour permettre
            //       le retour, pas la date de début de mobilisation.
            //       (sans quoi on pourrait faire le retour d'un événement avant même
            //       qu'il ait réellement commencé, ce qui n'a pas de sens).
            const startDate = moment(this.event.start_date);
            return startDate.isSameOrBefore(this.now, 'day');
        },

        isReturnInventoryDone() {
            return this.event.is_return_inventory_done;
        },

        isTeamMember() {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        isEditable() {
            const { event } = this;

            return (
                // - Un événement archivé n'est pas modifiable.
                !event.is_archived &&

                // - Un événement ne peut être modifié que si son inventaire de retour
                //   n'a pas été effectué (sans quoi celui-ci n'aurait plus aucun sens,
                //   d'autant que le stock global a pu être impacté suite à cet inventaire).
                !event.is_return_inventory_done
            );
        },

        isPrintable() {
            const { event, hasMaterials } = this;
            return event.materials && hasMaterials;
        },

        isRemovable() {
            return !this.isConfirmed && !this.isInventoryDone;
        },
    },
    mounted() {
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

        async handleToggleConfirm() {
            const {
                $t: __,
                event: { id },
                isTeamMember,
                isConfirming,
                isConfirmed,
                isConfirmTogglable,
            } = this;

            if (!isConfirmTogglable || !isTeamMember || isConfirming) {
                return;
            }
            this.isConfirming = true;

            try {
                const data = await apiEvents.setConfirmed(id, !isConfirmed);
                this.$emit('saved', data);
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
            } finally {
                this.isConfirming = false;
            }
        },

        async handleToggleArchived() {
            const {
                $t: __,
                event: { id },
                isTeamMember,
                isArchivable,
                isArchiving,
                isArchived,
            } = this;

            if (!isArchivable || !isTeamMember || isArchiving) {
                return;
            }
            this.isArchiving = true;

            try {
                const data = isArchived
                    ? await apiEvents.unarchive(id)
                    : await apiEvents.archive(id);

                this.$emit('saved', data);
            } catch (error) {
                const defaultMessage = __('errors.unexpected-while-saving');
                if (!axios.isAxiosError(error)) {
                    this.$toasted.error(defaultMessage);
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.$toasted.error(details.is_archived ?? defaultMessage);
                    } else {
                        this.$toasted.error(defaultMessage);
                    }
                }
            } finally {
                this.isArchiving = false;
            }
        },

        async handleDelete() {
            const { $t: __, event: { id }, isTeamMember, isRemovable, isDeleting } = this;
            if (!isRemovable || !isTeamMember || isDeleting) {
                return;
            }

            const isConfirmed = await confirm({
                type: 'danger',
                text: __('@event.confirm-delete'),
                confirmButtonText: __('yes-delete'),
            });
            if (!isConfirmed) {
                return;
            }
            this.isDeleting = true;

            try {
                await apiEvents.remove(id);
                this.$emit('deleted', id);
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isDeleting = false;
            }
        },

        async handleDuplicate() {
            const { isTeamMember, event } = this;
            if (!isTeamMember) {
                return;
            }

            const newEvent = await showModal(this.$modal, DuplicateEvent, { event });
            if (newEvent === undefined) {
                return;
            }

            this.$emit('duplicated', newEvent);
        },
    },
    render() {
        const {
            $t: __,
            event: { id },
            isPrintable,
            eventSummaryPdfUrl,
            isTeamMember,
            isEditable,
            isConfirmed,
            isConfirming,
            isConfirmTogglable,
            isArchived,
            isArchiving,
            isArchivable,
            isRemovable,
            isDeleting,
            hasStarted,
            hasMaterials,
            // hasMaterialShortage,
            isDepartureInventoryPeriodOpen,
            isDepartureInventoryPeriodClosed,
            isDepartureInventoryDone,
            isReturnInventoryPeriodOpen,
            isReturnInventoryDone,
            handleDelete,
            handleDuplicate,
            handleToggleConfirm,
            handleToggleArchived,
        } = this;

        const renderInventoryAction = () => {
            if (!isTeamMember || isArchived || !hasMaterials) {
                return null;
            }

            const isReturnInventoryViewable = isReturnInventoryPeriodOpen;
            const isDepartureInventoryViewable = (
                isDepartureInventoryPeriodOpen &&
                (isDepartureInventoryDone || !isDepartureInventoryPeriodClosed)
            );

            // FIXME: À re-activer lorsque les inventaires de retour terminés
            //        rendront disponibles les stocks utilisés dans l'événement
            //        (en bougeant la date de fin de mobilisation) OU quand la
            //        gestion horaire aura été implémentée.
            //        Sans ça, pour les événements qui partent juste après un autre
            //        dont l'inventaire de retour a été terminé, sur un même jour,
            //        on est bloqué car le système pense qu'il y a une pénurie.
            const isReturnInventoryUnavailable = false; // !isReturnInventoryDone && hasMaterialShortage;
            const isDepartureInventoryUnavailable = false; // !isDepartureInventoryDone && hasMaterialShortage;

            // - Si la période de tous les inventaires a commencé et qu'ils sont tous indisponible
            //   à cause du matériel manquant, on affiche qu'un seul bouton désactivé.
            const allInventoriesOpenAndUnavailable = (
                (isDepartureInventoryViewable && isDepartureInventoryUnavailable) &&
                (isReturnInventoryViewable && isReturnInventoryUnavailable)
            );
            if (allInventoriesOpenAndUnavailable) {
                return (
                    <Button
                        icon="tasks"
                        type="primary"
                        tooltip={__('modal.event-details.inventories-unavailable-help')}
                        disabled
                    >
                        {__('inventories')}
                    </Button>
                );
            }

            const actions = [];
            if (isDepartureInventoryViewable) {
                actions.push(
                    <Button
                        type={!isDepartureInventoryDone ? 'primary' : 'default'}
                        icon="boxes"
                        disabled={isDepartureInventoryUnavailable}
                        to={(
                            !isDepartureInventoryUnavailable
                                ? { name: 'event-departure-inventory', params: { id } }
                                : undefined
                        )}
                        tooltip={(
                            isDepartureInventoryUnavailable
                                ? __('modal.event-details.inventory-unavailable-help')
                                : undefined
                        )}
                    >
                        {__('departure-inventory')}
                    </Button>,
                );
            }
            if (isReturnInventoryViewable) {
                actions.push(
                    <Button
                        type={!isReturnInventoryDone ? 'primary' : 'default'}
                        icon="tasks"
                        disabled={isReturnInventoryUnavailable}
                        to={(
                            !isReturnInventoryUnavailable
                                ? { name: 'event-return-inventory', params: { id } }
                                : undefined
                        )}
                        tooltip={(
                            isReturnInventoryUnavailable
                                ? __('modal.event-details.inventory-unavailable-help')
                                : undefined
                        )}
                    >
                        {__('return-inventory')}
                    </Button>,
                );
            }

            if (actions.length < 2) {
                return actions.shift() ?? null;
            }

            const isAllInventoriesDone = isDepartureInventoryDone && isReturnInventoryDone;
            return (
                <Dropdown
                    icon="tasks"
                    type={!isAllInventoriesDone ? 'primary' : 'default'}
                    label={__('inventories')}
                >
                    {actions}
                </Dropdown>
            );
        };

        return (
            <div class="EventDetailsHeaderActions">
                {isPrintable && (
                    <ButtonDropdown
                        icon="print"
                        label={__('print')}
                        to={eventSummaryPdfUrl}
                        external
                        class="EventDetailsHeaderActions__print"
                        actions={[
                            {
                                label: __('modal.event-details.release-sheet-by-lists'),
                                icon: 'print',
                                target: `${eventSummaryPdfUrl}?sortedBy=lists`,
                                external: true,
                            },
                            {
                                label: __('modal.event-details.release-sheet-by-parks'),
                                icon: 'print',
                                target: `${eventSummaryPdfUrl}?sortedBy=parks`,
                                external: true,
                            },
                        ]}
                    />
                )}
                {(isTeamMember && isEditable) && (
                    <Button
                        icon="edit"
                        type={!hasStarted ? 'primary' : 'default'}
                        to={{ name: 'edit-event', params: { id } }}
                    >
                        {__('action-edit')}
                    </Button>
                )}
                {renderInventoryAction()}
                {isTeamMember && (
                    <Dropdown>
                        {isConfirmTogglable && (
                            <Button
                                type={isConfirmed ? 'warning' : 'success'}
                                icon={isConfirmed ? 'hourglass-half' : 'check'}
                                loading={isConfirming}
                                onClick={handleToggleConfirm}
                            >
                                {isConfirmed ? __('unconfirm-event') : __('confirm-event')}
                            </Button>
                        )}
                        {isArchivable && (
                            <Button
                                type={isArchived ? 'default' : 'primary'}
                                icon="archive"
                                loading={isArchiving}
                                onClick={handleToggleArchived}
                            >
                                {
                                    isArchived
                                        ? __('modal.event-details.unarchive')
                                        : __('modal.event-details.archive')
                                }
                            </Button>
                        )}
                        <Button
                            icon="copy"
                            type="primary"
                            onClick={handleDuplicate}
                        >
                            {__('duplicate-event')}
                        </Button>
                        {isRemovable && (
                            <Button
                                type="delete"
                                loading={isDeleting}
                                onClick={handleDelete}
                            >
                                {__('delete-event')}
                            </Button>
                        )}
                    </Dropdown>
                )}
            </div>
        );
    },
});

export default EventDetailsHeaderActions;
