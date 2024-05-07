import './index.scss';
import axios from 'axios';
import config from '@/globals/config';
import DateTime from '@/utils/datetime';
import upperFirst from 'lodash/upperFirst';
import { Group } from '@/stores/api/groups';
import { ApiErrorCode } from '@/stores/api/@codes';
import { defineComponent } from '@vue/composition-api';
import { getBookingIconFromEvent } from '@/utils/getBookingIcon';
import { confirm } from '@/utils/alert';
import showModal from '@/utils/showModal';
import apiEvents from '@/stores/api/events';
import DuplicateEvent from '@/themes/default/modals/DuplicateEvent';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Dropdown from '@/themes/default/components/Dropdown';
import ButtonDropdown from '@/themes/default/components/ButtonDropdown';

import type { PropType } from '@vue/composition-api';
import type { EventDetails } from '@/stores/api/events';

type Props = {
    /** L'événement dont on veut afficher le header. */
    event: EventDetails,
};

type InstanceProperties = {
    nowTimer: ReturnType<typeof setInterval> | undefined,
};

type Data = {
    now: DateTime,
    isConfirming: boolean,
    isSending: boolean,
    isArchiving: boolean,
    isDeleting: boolean,
};

/** Header de la modale de détails d'un événement. */
const EventDetailsHeader = defineComponent({
    name: 'EventDetailsHeader',
    props: {
        event: {
            type: Object as PropType<Props['event']>,
            required: true,
        },
    },
    emits: [
        'saved',
        'duplicated',
        'deleted',
        'close',
    ],
    setup: (): InstanceProperties => ({
        nowTimer: undefined,
    }),
    data: (): Data => ({
        now: DateTime.now(),
        isConfirming: false,
        isSending: false,
        isArchiving: false,
        isDeleting: false,
    }),
    computed: {
        icon(): string {
            return getBookingIconFromEvent(this.event, this.now);
        },

        summaryPdfUrl(): string {
            const { id } = this.event;
            return `${config.baseUrl}/events/${id}/pdf`;
        },

        isOperationOngoing(): boolean {
            // NOTE: On considère que ce n'est plus "en cours" si on est pas
            //       dans la période de mobilisation, même si la période
            //       d'opération est encore en cours.
            return (
                this.now.isBetween(this.event.operation_period) &&
                this.now.isBetween(this.event.mobilization_period)
            );
        },

        isTeamMember(): boolean {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        hasStarted(): boolean {
            const { mobilization_period: mobilizationPeriod } = this.event;
            return mobilizationPeriod.isBeforeOrDuring(this.now);
        },

        isPast(): boolean {
            const { mobilization_period: mobilizationPeriod } = this.event;
            return mobilizationPeriod.isBefore(this.now);
        },

        hasMaterials(): boolean {
            return this.event.materials.length > 0;
        },

        hasMaterialShortage(): boolean {
            return this.event.has_missing_materials === true;
        },

        isDepartureInventoryPeriodOpen(): boolean {
            // - 30 jours avant le début de mobilisation prévu.
            const { mobilization_period: mobilisationPeriod } = this.event;
            return mobilisationPeriod.start.subDay(30).isSameOrBefore(this.now);
        },

        isDepartureInventoryPeriodClosed(): boolean {
            // - Si l'inventaire de retour est fait, la période de réalisation
            //   des inventaires de départ est forcément fermée.
            if (this.isReturnInventoryDone) {
                return true;
            }

            // NOTE: On laisse un délai de 1 jour après la date de début de mobilisation
            //       pour faire l'inventaire de départ (mais en ne dépassant jamais la date
            //       de fin de mobilisation).
            const { mobilization_period: mobilisationPeriod } = this.event;
            let inventoryPeriodCloseDate = mobilisationPeriod.start.addDay();
            if (inventoryPeriodCloseDate.isAfter(mobilisationPeriod.end as any)) {
                inventoryPeriodCloseDate = mobilisationPeriod.end;
            }

            return inventoryPeriodCloseDate.isBefore(this.now);
        },

        isDepartureInventoryDone(): boolean {
            return this.event.is_departure_inventory_done;
        },

        isReturnInventoryPeriodOpen(): boolean {
            // NOTE: C'est la date de début de réservation qui fait foi pour permettre
            //       le retour, pas la date de début de mobilisation.
            //       (sans quoi on pourrait faire le retour d'une réservation avant même
            //       qu'il ait réellement commencée, ce qui n'a pas de sens).
            const { operation_period: operationPeriod } = this.event;
            return operationPeriod.isBeforeOrDuring(this.now);
        },

        isEditable(): boolean {
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

        isReturnInventoryDone(): boolean {
            return this.event.is_return_inventory_done;
        },

        isConfirmed(): boolean {
            return this.event.is_confirmed;
        },

        isConfirmTogglable(): boolean {
            return !this.isPast && (this.isConfirmed || this.hasMaterials);
        },

        isArchived(): boolean {
            return this.event.is_archived;
        },

        isArchivable(): boolean {
            return this.isPast && this.isReturnInventoryDone;
        },

        isPrintable(): boolean {
            return this.hasMaterials;
        },

        isRemovable(): boolean {
            return !this.isConfirmed && !this.isReturnInventoryDone;
        },
    },
    mounted() {
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

        async handleToggleConfirm() {
            const {
                __,
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
                this.$toasted.error(__('global.errors.unexpected-while-saving'));
            } finally {
                this.isConfirming = false;
            }
        },

        async handleToggleArchived() {
            const {
                __,
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
                const defaultMessage = __('global.errors.unexpected-while-saving');
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
            const { __, event: { id }, isTeamMember, isRemovable, isDeleting } = this;
            if (!isRemovable || !isTeamMember || isDeleting) {
                return;
            }

            const isConfirmed = await confirm({
                type: 'danger',
                text: __('global.@event.confirm-delete'),
                confirmButtonText: __('global.yes-delete'),
            });
            if (!isConfirmed) {
                return;
            }
            this.isDeleting = true;

            try {
                await apiEvents.remove(id);
                this.$emit('deleted', id);
            } catch {
                this.$toasted.error(__('global.errors.unexpected-while-deleting'));
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

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `modal.event-details.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            icon,
            event,
            isPrintable,
            summaryPdfUrl,
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
            isOperationOngoing,
            hasMaterialShortage,
            isDepartureInventoryPeriodOpen,
            isDepartureInventoryPeriodClosed,
            isDepartureInventoryDone,
            isReturnInventoryPeriodOpen,
            isReturnInventoryDone,
            handleDelete,
            handleDuplicate,
            handleToggleConfirm,
            handleToggleArchived,
            handleClose,
        } = this;

        const renderInventoryAction = (): JSX.Element | null => {
            if (!isTeamMember || isArchived || !hasMaterials) {
                return null;
            }

            const isReturnInventoryViewable = isReturnInventoryPeriodOpen;
            const isDepartureInventoryViewable = (
                isDepartureInventoryPeriodOpen &&
                (isDepartureInventoryDone || !isDepartureInventoryPeriodClosed)
            );

            const isReturnInventoryUnavailable = !isReturnInventoryDone && hasMaterialShortage;
            const isDepartureInventoryUnavailable = !isDepartureInventoryDone && hasMaterialShortage;

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
                        tooltip={__('inventories-unavailable-help')}
                        disabled
                    >
                        {__('global.inventories')}
                    </Button>
                );
            }

            const actions = [];
            if (isDepartureInventoryViewable) {
                actions.push(
                    <Button
                        icon="boxes"
                        type={!isDepartureInventoryDone ? 'primary' : 'default'}
                        disabled={isDepartureInventoryUnavailable}
                        to={(
                            !isDepartureInventoryUnavailable
                                ? {
                                    name: 'event-departure-inventory',
                                    params: { id: event.id },
                                }
                                : undefined
                        )}
                        tooltip={(
                            isDepartureInventoryUnavailable
                                ? __('inventory-unavailable-help')
                                : undefined
                        )}
                    >
                        {__('global.departure-inventory')}
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
                                ? {
                                    name: 'event-return-inventory',
                                    params: { id: event.id },
                                }
                                : undefined
                        )}
                        tooltip={(
                            isReturnInventoryUnavailable
                                ? __('inventory-unavailable-help')
                                : undefined
                        )}
                    >
                        {__('global.return-inventory')}
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
                    label={__('global.inventories')}
                >
                    {actions}
                </Dropdown>
            );
        };

        const renderSecondaryActions = (): JSX.Element | null => {
            if (!isTeamMember) {
                return null;
            }

            const actions = [];

            if (isConfirmTogglable) {
                actions.push(
                    <Button
                        type={isConfirmed ? 'warning' : 'success'}
                        icon={isConfirmed ? 'hourglass-half' : 'check'}
                        loading={isConfirming}
                        onClick={handleToggleConfirm}
                    >
                        {isConfirmed ? __('global.unconfirm-event') : __('global.confirm-event')}
                    </Button>,
                );
            }

            if (isArchivable) {
                actions.push(
                    <Button
                        type="default"
                        icon="archive"
                        loading={isArchiving}
                        onClick={handleToggleArchived}
                    >
                        {
                            isArchived
                                ? __('unarchive')
                                : __('archive')
                        }
                    </Button>,
                );
            }

            actions.push(
                <Button
                    icon="copy"
                    type="default"
                    onClick={handleDuplicate}
                >
                    {__('global.duplicate-event')}
                </Button>,
            );

            if (isRemovable) {
                actions.push(
                    <Button
                        type="delete"
                        loading={isDeleting}
                        onClick={handleDelete}
                    >
                        {__('global.delete-event')}
                    </Button>,
                );
            }

            return actions.length > 0
                ? <Dropdown>{actions}</Dropdown>
                : null;
        };

        return (
            <header class="EventDetailsHeader">
                <Icon
                    name={icon}
                    class={['EventDetailsHeader__icon', {
                        'EventDetailsHeader__icon--warning': (
                            icon === 'exclamation-triangle'
                        ),
                    }]}
                />
                <div class="EventDetailsHeader__title">
                    <h1 class="EventDetailsHeader__title__primary">{event.title}</h1>
                    <div class="EventDetailsHeader__title__secondary">
                        {upperFirst(event.operation_period.toReadable(this.$t))}
                        {isOperationOngoing && (
                            <span class="EventDetailsHeader__title__in-progress">
                                ({__('global.in-progress')})
                            </span>
                        )}
                    </div>
                </div>
                <div class="EventDetailsHeader__actions">
                    {isPrintable && (
                        <ButtonDropdown
                            icon="print"
                            label={__('global.print')}
                            to={summaryPdfUrl}
                            external
                            class="EventDetailsHeader__actions__print"
                            actions={[
                                {
                                    label: __('release-sheet-by-lists'),
                                    icon: 'print',
                                    target: `${summaryPdfUrl}?sortedBy=lists`,
                                    external: true,
                                },
                                {
                                    label: __('release-sheet-by-parks'),
                                    icon: 'print',
                                    target: `${summaryPdfUrl}?sortedBy=parks`,
                                    external: true,
                                },
                            ]}
                        />
                    )}
                    {(isTeamMember && isEditable) && (
                        <Button
                            icon="edit"
                            type={!hasStarted ? 'primary' : 'default'}
                            to={{ name: 'edit-event', params: { id: event.id } }}
                        >
                            {__('global.action-edit')}
                        </Button>
                    )}
                    {renderInventoryAction()}
                    {renderSecondaryActions()}
                </div>
                <Button
                    type="close"
                    class="EventDetailsHeader__close-button"
                    onClick={handleClose}
                />
            </header>
        );
    },
});

export default EventDetailsHeader;
