import './index.scss';
import moment from 'moment';
import { toRefs, computed, ref } from '@vue/composition-api';
import axios from 'axios';
import config from '@/globals/config';
import { confirm } from '@/utils/alert';
import showModal from '@/utils/showModal';
import useI18n from '@/hooks/useI18n';
import useNow from '@/hooks/useNow';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiEvents from '@/stores/api/events';
import DuplicateEvent from '@/themes/default/modals/DuplicateEvent';
import Dropdown, { getItemClassnames } from '@/themes/default/components/Dropdown';
import Button from '@/themes/default/components/Button';
import { Group } from '@/stores/api/groups';

// @vue/component
const EventDetailsHeaderActions = (props, { root, emit }) => {
    const { event } = toRefs(props);
    const __ = useI18n();
    const now = useNow();

    const isConfirming = ref(false);
    const isArchiving = ref(false);
    const isDeleting = ref(false);

    const startDate = computed(() => moment(event.value.start_date));
    const endDate = computed(() => moment(event.value.end_date));
    const hasMaterials = computed(() => event.value.materials.length > 0);
    const isConfirmable = computed(() => event.value.materials.length === 0);
    const hasStarted = computed(() => startDate.value.isSameOrBefore(now.value));
    const isEventPast = computed(() => endDate.value.isBefore(now.value, 'day'));

    const isPrintable = computed(() => (
        event.value.materials &&
        hasMaterials.value &&
        event.value.beneficiaries &&
        event.value.beneficiaries.length > 0
    ));

    const isTeamMember = computed(() => (
        root.$store.getters['auth/is']([Group.MEMBER, Group.ADMIN])
    ));

    const isEditable = computed(() => {
        const {
            is_confirmed: isConfirmed,
            is_return_inventory_done: isInventoryDone,
        } = event.value;

        return !isEventPast.value || !(isInventoryDone || isConfirmed);
    });

    const isRemovable = computed(() => {
        const {
            is_confirmed: isConfirmed,
            is_return_inventory_done: isInventoryDone,
        } = event.value;

        return !(isConfirmed || isInventoryDone);
    });

    const eventSummaryPdfUrl = computed(() => {
        const { id } = event.value || { id: null };
        return `${config.baseUrl}/events/${id}/pdf`;
    });

    const handleToggleConfirm = async () => {
        if (!isTeamMember.value || isConfirming.value) {
            return;
        }
        isConfirming.value = true;

        const { id, is_confirmed: isConfirmed } = event.value;

        try {
            const data = await apiEvents.setConfirmed(id, !isConfirmed);
            emit('saved', data);
        } catch {
            root.$toasted.error(__('errors.unexpected-while-saving'));
        } finally {
            isConfirming.value = false;
        }
    };

    const handleToggleArchived = async () => {
        if (!isTeamMember.value || isArchiving.value) {
            return;
        }
        isArchiving.value = true;

        const { id, is_archived: isArchived } = event.value;

        try {
            const data = isArchived
                ? await apiEvents.unarchive(id)
                : await apiEvents.archive(id);

            emit('saved', data);
        } catch (error) {
            const defaultMessage = __('errors.unexpected-while-saving');
            if (!axios.isAxiosError(error)) {
                root.$toasted.error(defaultMessage);
            } else {
                const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    root.$toasted.error(details.is_archived ?? defaultMessage);
                } else {
                    root.$toasted.error(defaultMessage);
                }
            }
        } finally {
            isArchiving.value = false;
        }
    };

    const handleDelete = async () => {
        if (!isTeamMember.value || !isRemovable.value || isDeleting.value) {
            return;
        }

        const isConfirmed = await confirm({
            title: __('please-confirm'),
            text: __('@event.confirm-delete'),
            confirmButtonText: __('yes-delete'),
            type: 'danger',
        });
        if (!isConfirmed) {
            return;
        }
        isDeleting.value = true;

        const { id } = event.value;

        try {
            await apiEvents.remove(id);
            emit('deleted', id);
        } catch {
            root.$toasted.error(__('errors.unexpected-while-deleting'));
        } finally {
            isDeleting.value = false;
        }
    };

    const handleDuplicated = (newEvent) => {
        emit('duplicated', newEvent);
    };

    const askDuplicate = () => {
        if (!isTeamMember.value) {
            return;
        }

        showModal(root.$modal, DuplicateEvent, {
            event: event.value,
            onDuplicated: handleDuplicated,
        });
    };

    return () => {
        const {
            id,
            is_confirmed: isConfirmed,
            is_return_inventory_done: isReturnInventoryDone,
            is_archived: isArchived,
        } = event.value;

        return (
            <div class="EventDetailsHeaderActions">
                {isPrintable.value && (
                    <Button
                        icon="print"
                        type="secondary"
                        to={eventSummaryPdfUrl.value}
                        external
                    >
                        {__('print')}
                    </Button>
                )}
                {isEditable.value && isTeamMember.value && (
                    <Button
                        type="primary"
                        icon="edit"
                        to={{ name: 'edit-event', params: { id } }}
                    >
                        {__('action-edit')}
                    </Button>
                )}
                {(isEventPast.value || hasStarted.value) && !isArchived && isTeamMember.value && (
                    <Button
                        type="primary"
                        icon="tasks"
                        to={{ name: 'event-return-inventory', params: { id } }}
                    >
                        {__('return-inventory')}
                    </Button>
                )}
                {isTeamMember.value && (
                    <Dropdown variant="actions">
                        <template slot="items">
                            {!isEventPast.value && (
                                <Button
                                    type={isConfirmed ? 'warning' : 'success'}
                                    icon={isConfirmed ? 'hourglass-half' : 'check'}
                                    class={{ ...getItemClassnames() }}
                                    disabled={isConfirmable.value}
                                    loading={isConfirming.value}
                                    onClick={handleToggleConfirm}
                                >
                                    {isConfirmed ? __('unconfirm-event') : __('confirm-event')}
                                </Button>
                            )}
                            {isEventPast.value && isReturnInventoryDone && (
                                <Button
                                    type={isArchived ? 'default' : 'primary'}
                                    icon="archive"
                                    class={{ ...getItemClassnames() }}
                                    loading={isArchiving.value}
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
                                class={{ ...getItemClassnames() }}
                                onClick={askDuplicate}
                            >
                                {__('duplicate-event')}
                            </Button>
                            {isRemovable.value && (
                                <Button
                                    type="delete"
                                    class={{ ...getItemClassnames() }}
                                    loading={isDeleting.value}
                                    onClick={handleDelete}
                                >
                                    {__('delete-event')}
                                </Button>
                            )}
                        </template>
                    </Dropdown>
                )}
            </div>
        );
    };
};

EventDetailsHeaderActions.props = {
    event: { type: Object, required: true },
};

EventDetailsHeaderActions.emits = ['saved', 'deleted', 'duplicated'];

export default EventDetailsHeaderActions;
