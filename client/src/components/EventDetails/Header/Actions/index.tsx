import './index.scss';
import { toRefs, computed, ref } from '@vue/composition-api';
import Config from '@/globals/config';
import requester from '@/globals/requester';
import { confirm } from '@/utils/alert';
import useI18n from '@/hooks/useI18n';
import Dropdown, { getItemClassnames } from '@/components/Dropdown';
import DuplicateEvent from '@/components/DuplicateEvent';
import ListTemplateFromEvent from '@/components/ListTemplateFromEvent';

import type { Render, SetupContext } from '@vue/composition-api';
import type { RouterLinkRenderFunctionArgs } from '@/globals/types/router-link';
import type { FormatedEvent } from '@/stores/api/events';

type Props = {
    event: FormatedEvent,
};

// @vue/component
const EventDetailsHeaderActions = (props: Props, { root, emit }: SetupContext): Render => {
    const __ = useI18n();
    const { event } = toRefs(props);

    const isConfirming = ref<boolean>(false);
    const isArchiving = ref<boolean>(false);
    const isDeleting = ref<boolean>(false);

    const hasMaterials = computed(() => (
        event.value.materials.length > 0
    ));

    const isPrintable = computed(() => (
        event.value.materials &&
        hasMaterials.value &&
        event.value.beneficiaries &&
        event.value.beneficiaries.length > 0
    ));

    const isVisitor = computed(() => (
        root.$store.getters['auth/is']('visitor')
    ));

    const isEditable = computed(() => {
        const { isPast, isConfirmed, isInventoryDone } = event.value;
        return !isPast || !(isInventoryDone || isConfirmed);
    });

    const isRemovable = computed(() => {
        const { isConfirmed, isInventoryDone } = event.value;
        return !(isConfirmed || isInventoryDone);
    });

    const isConfirmable = computed(() => event.value.materials?.length === 0);

    const isEndToday = computed(() => event.value.endDate.isSame(new Date(), 'day'));

    const eventSummaryPdfUrl = computed(() => {
        const { baseUrl } = Config;
        const { id } = event.value || { id: null };
        return `${baseUrl}/events/${id}/pdf`;
    });

    const setEventConfirmation = async (isConfirmed: boolean): Promise<void> => {
        if (isConfirming.value) {
            return;
        }
        isConfirming.value = true;

        const { id } = event.value;

        try {
            const url = `events/${id}`;
            const { data } = await requester.put(url, { id, is_confirmed: isConfirmed });
            emit('saved', data);
        } catch (error) {
            emit('error', error);
        } finally {
            // eslint-disable-next-line require-atomic-updates
            isConfirming.value = false;
        }
    };

    const toggleConfirmed = (): void => {
        setEventConfirmation(!event.value.isConfirmed);
    };

    const setEventArchived = async (isArchived: boolean): Promise<void> => {
        if (isArchiving.value) {
            return;
        }
        isArchiving.value = true;

        const { id } = event.value;

        try {
            const url = `events/${id}`;
            const { data } = await requester.put(url, { id, is_archived: isArchived });
            emit('saved', data);
        } catch (error) {
            emit('error', error);
        } finally {
            // eslint-disable-next-line require-atomic-updates
            isArchiving.value = false;
        }
    };

    const toggleArchived = (): void => {
        setEventArchived(event.value.isArchived);
    };

    const handleDelete = async (): Promise<void> => {
        if (isVisitor.value || !isRemovable.value || isDeleting.value) {
            return;
        }

        const { value: isConfirmed } = await confirm({
            title: __('please-confirm'),
            text: __('page-calendar.confirm-delete'),
            confirmButtonText: __('yes-delete'),
            type: 'warning',
        });
        if (!isConfirmed) {
            return;
        }
        // eslint-disable-next-line require-atomic-updates
        isDeleting.value = true;

        const { id } = event.value;

        try {
            await requester.delete(`events/${id}`);
            emit('deleted', id);
        } catch (error) {
            emit('error', error);
        } finally {
            // eslint-disable-next-line require-atomic-updates
            isDeleting.value = false;
        }
    };

    const handleDuplicated = (newEvent: Event): void => {
        emit('duplicated', newEvent);
    };

    const askDuplicate = (): void => {
        root.$modal.show(DuplicateEvent, { event: event.value, onDuplicated: handleDuplicated }, {
            width: 600,
            draggable: true,
            clickToClose: false,
        });
    };

    const askCreateListTemplate = (): void => {
        const { materials } = event.value;

        root.$modal.show(ListTemplateFromEvent, { materials }, {
            width: 600,
            draggable: true,
            clickToClose: false,
        });
    };

    return () => {
        const {
            id,
            isPast,
            isConfirmed,
            isInventoryDone,
            isArchived,
        } = event.value;

        return (
            <div class="EventDetailsHeaderActions">
                {isPrintable.value && (
                    <a href={eventSummaryPdfUrl.value} class="button outline" target="_blank" rel="noreferrer">
                        <i class="fas fa-print" /> {__('print')}
                    </a>
                )}
                {isEditable.value && (
                    <router-link to={`/events/${id}`} custom>
                        {({ navigate }: RouterLinkRenderFunctionArgs) => (
                            <button type="button" class="info" onClick={navigate}>
                                <i class="fas fa-edit" /> {__('action-edit')}
                            </button>
                        )}
                    </router-link>
                )}
                {(isPast || isEndToday.value) && !isArchived && (
                    <router-link to={`/event-return/${id}`} custom>
                        {({ navigate }: RouterLinkRenderFunctionArgs) => (
                            <button type="button" class="info" onClick={navigate}>
                                <i class="fas fa-tasks" /> {__('return-inventory')}
                            </button>
                        )}
                    </router-link>
                )}
                <Dropdown variant="actions">
                    <template slot="items">
                        {!isPast && (
                            <button
                                type="button"
                                class={{
                                    ...getItemClassnames(),
                                    info: isConfirmed,
                                    success: !isConfirmed,
                                }}
                                disabled={isConfirmable.value}
                                onClick={toggleConfirmed}
                            >
                                {(!isConfirming.value && !isConfirmed) && <i class="fas fa-check" />}
                                {(!isConfirming.value && isConfirmed) && <i class="fas fa-hourglass-half" />}
                                {isConfirming.value && <i class="fas fa-circle-notch fa-spin" />}
                                {' '}{isConfirmed ? __('unconfirm-event') : __('confirm-event')}
                            </button>
                        )}
                        {isPast && isInventoryDone && (
                            <button
                                type="button"
                                class={{ ...getItemClassnames(), info: !isArchived }}
                                onClick={toggleArchived}
                            >
                                {!isArchiving.value && <i class="fas fa-archive" />}
                                {isArchiving.value && <i class="fas fa-circle-notch fa-spin" />}
                                {' '}{isArchived ? __('unarchive-event') : __('archive-event')}
                            </button>
                        )}
                        <button
                            type="button"
                            class={{ ...getItemClassnames(), warning: true }}
                            onClick={askDuplicate}
                        >
                            <i class="fas fa-copy" /> {__('duplicate-event')}
                        </button>
                        {isRemovable.value && (
                            <button
                                type="button"
                                class={{ ...getItemClassnames(), danger: true }}
                                onClick={handleDelete}
                            >
                                {!isDeleting.value && <i class="fas fa-trash" />}
                                {isDeleting.value && <i class="fas fa-circle-notch fa-spin" />}
                                {' '}{__('delete-event')}
                            </button>
                        )}
                        {hasMaterials.value && (
                            <button
                                type="button"
                                class={{ ...getItemClassnames() }}
                                onClick={askCreateListTemplate}
                            >
                                <i class="fas fa-list" /> {__('create-list-template-from-event')}
                            </button>
                        )}
                    </template>
                </Dropdown>
            </div>
        );
    };
};

EventDetailsHeaderActions.props = {
    event: { type: Object, required: true },
};
EventDetailsHeaderActions.emits = ['saved', 'deleted', 'duplicated', 'error'];

export default EventDetailsHeaderActions;
