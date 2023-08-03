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
import ButtonDropdown from '@/themes/default/components/ButtonDropdown';
import Button from '@/themes/default/components/Button';
import { Group } from '@/stores/api/groups';

// @vue/component
const EventDetailsHeaderActions = defineComponent({
    name: 'EventDetailsHeaderActions',
    props: {
        event: { type: Object, required: true },
    },
    emits: ['saved', 'deleted', 'duplicated'],
    data() {
        return {
            now: Date.now(),
            isConfirming: false,
            isArchiving: false,
            isDeleting: false,
        };
    },
    computed: {
        startDate() {
            return moment(this.event.start_date);
        },

        endDate() {
            return moment(this.event.end_date);
        },

        hasMaterials() {
            return this.event.materials.length > 0;
        },

        isConfirmable() {
            return this.event.materials.length === 0;
        },

        hasStarted() {
            return this.startDate.isSameOrBefore(this.now);
        },

        isEventPast() {
            return this.endDate.isBefore(this.now, 'day');
        },

        isPrintable() {
            const { event, hasMaterials } = this;
            return (
                event.materials &&
                hasMaterials &&
                event.beneficiaries &&
                event.beneficiaries.length > 0
            );
        },

        isTeamMember() {
            return this.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN]);
        },

        isEditable() {
            const {
                is_confirmed: isConfirmed,
                is_return_inventory_done: isInventoryDone,
            } = this.event;

            return !this.isEventPast || !(isInventoryDone || isConfirmed);
        },

        isRemovable() {
            const {
                is_confirmed: isConfirmed,
                is_return_inventory_done: isInventoryDone,
            } = this.event;

            return !(isConfirmed || isInventoryDone);
        },

        eventSummaryPdfUrl() {
            const { id } = this.event ?? { id: null };
            return `${config.baseUrl}/events/${id}/pdf`;
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeUnmount() {
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
            const { $t: __, isTeamMember, isConfirming } = this;
            if (!isTeamMember || isConfirming) {
                return;
            }
            this.isConfirming = true;

            const { id, is_confirmed: isConfirmed } = this.event;

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
            const { $t: __, isTeamMember, isArchiving } = this;
            if (!isTeamMember || isArchiving) {
                return;
            }
            this.isArchiving = true;

            const { id, is_archived: isArchived } = this.event;

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
            const { $t: __, isTeamMember, isRemovable, isDeleting } = this;
            if (!isTeamMember || !isRemovable || isDeleting) {
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

            const { id } = this.event;

            try {
                await apiEvents.remove(id);
                this.$emit('deleted', id);
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isDeleting = false;
            }
        },

        handleDuplicated(newEvent) {
            this.$emit('duplicated', newEvent);
        },

        askDuplicate() {
            const { isTeamMember, event, handleDuplicated } = this;
            if (!isTeamMember) {
                return;
            }

            showModal(this.$modal, DuplicateEvent, {
                event,
                onDuplicated: handleDuplicated,
            });
        },
    },
    render() {
        const {
            $t: __,
            event,
            isPrintable,
            eventSummaryPdfUrl,
            isEditable,
            isTeamMember,
            isEventPast,
            hasStarted,
            isConfirmable,
            isConfirming,
            handleToggleConfirm,
            isArchiving,
            handleToggleArchived,
            askDuplicate,
            isRemovable,
            isDeleting,
            handleDelete,
        } = this;

        const {
            id,
            is_confirmed: isConfirmed,
            is_return_inventory_done: isReturnInventoryDone,
            is_archived: isArchived,
        } = event;

        return (
            <div class="EventDetailsHeaderActions">
                {isPrintable && (
                    <ButtonDropdown
                        icon="print"
                        label={__('print')}
                        type="secondary"
                        to={eventSummaryPdfUrl}
                        external
                        class="EventDetailsHeaderActions__print"
                        actions={[
                            {
                                label: __('modal.event-details.release-sheet-by-lists'),
                                type: 'secondary',
                                icon: 'print',
                                target: `${eventSummaryPdfUrl}?sortedBy=lists`,
                                external: true,
                            },
                            {
                                label: __('modal.event-details.release-sheet-by-parks'),
                                type: 'secondary',
                                icon: 'print',
                                target: `${eventSummaryPdfUrl}?sortedBy=parks`,
                                external: true,
                            },
                        ]}
                    />
                )}
                {isEditable && isTeamMember && (
                    <Button
                        type="primary"
                        icon="edit"
                        to={{ name: 'edit-event', params: { id } }}
                    >
                        {__('action-edit')}
                    </Button>
                )}
                {(isEventPast || hasStarted) && !isArchived && isTeamMember && (
                    <Button
                        type="primary"
                        icon="tasks"
                        to={{ name: 'event-return-inventory', params: { id } }}
                    >
                        {__('return-inventory')}
                    </Button>
                )}
                {isTeamMember && (
                    <Dropdown>
                        {!isEventPast && (
                            <Button
                                type={isConfirmed ? 'warning' : 'success'}
                                icon={isConfirmed ? 'hourglass-half' : 'check'}
                                disabled={isConfirmable}
                                loading={isConfirming}
                                onClick={handleToggleConfirm}
                            >
                                {isConfirmed ? __('unconfirm-event') : __('confirm-event')}
                            </Button>
                        )}
                        {isEventPast && isReturnInventoryDone && (
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
                            onClick={askDuplicate}
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
