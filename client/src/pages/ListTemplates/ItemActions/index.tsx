import { ref, toRefs } from '@vue/composition-api';
import requester from '@/globals/requester';
import useI18n from '@/hooks/useI18n';
import { confirm } from '@/utils/alert';

import type { Render, SetupContext } from '@vue/composition-api';

type Props = {
    id: number,
    isTrashMode: boolean,
    onChanged?(): void,
    onError?(): void,
};

// @vue/component
const ListTemplatesItemActions = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();

    const { id, isTrashMode } = toRefs(props);

    const isLoading = ref<boolean>(false);

    const handleDelete = async (): Promise<void> => {
        const isSoftDelete = !isTrashMode.value;
        const { value: isConfirmed } = await confirm({
            title: __('please-confirm'),
            text: isSoftDelete
                ? __('page-list-templates.confirm-delete')
                : __('page-list-templates.confirm-permanently-delete'),
            confirmButtonText: isSoftDelete ? __('yes-delete') : __('yes-permanently-delete'),
            type: isSoftDelete ? 'trash' : 'delete',
        });
        if (!isConfirmed) {
            return;
        }

        isLoading.value = true;

        try {
            await requester.delete(`list-templates/${id.value}`);
            emit('changed', id.value);
        } catch (err) {
            emit('error', err);
        } finally {
            isLoading.value = false;
        }
    };

    const handleRestore = async (): Promise<void> => {
        const { value: isConfirmed } = await confirm({
            title: __('please-confirm'),
            text: __('page-list-templates.confirm-restore'),
            confirmButtonText: __('yes-restore'),
            type: 'restore',
        });
        if (!isConfirmed) {
            return;
        }

        isLoading.value = true;

        try {
            await requester.put(`list-templates/restore/${id.value}`);
            emit('changed', id.value);
        } catch (err) {
            emit('error', err);
        } finally {
            isLoading.value = false;
        }
    };

    return () => {
        if (isLoading.value) {
            return (
                <div><i class="fas fa-spin fa-circle-notch" /></div>
            );
        }

        if (isTrashMode.value) {
            return (
                <div>
                    <button
                        type="button"
                        v-tooltip={__('action-restore')}
                        class="item-actions__button info"
                        onClick={handleRestore}
                    >
                        <i class="fas fa-trash-restore" />
                    </button>
                    <button
                        type="button"
                        v-tooltip={__('action-delete')}
                        class="item-actions__button danger"
                        onClick={handleDelete}
                    >
                        <i class="fas fa-trash-alt" />
                    </button>
                </div>
            );
        }

        return (
            <div>
                <router-link
                    v-tooltip={__('action-view')}
                    to={`/list-templates/${id.value}/view`}
                    class="button success item-actions__button"
                >
                    <i class="fas fa-eye" />
                </router-link>
                <router-link
                    v-tooltip={__('action-edit')}
                    to={`/list-templates/${id.value}`}
                    class="button info item-actions__button"
                >
                    <i class="fas fa-edit" />
                </router-link>
                <button
                    type="button"
                    v-tooltip={__('action-trash')}
                    class="item-actions__button warning"
                    onClick={handleDelete}
                >
                    <i class="fas fa-trash" />
                </button>
            </div>
        );
    };
};

ListTemplatesItemActions.props = {
    id: { type: Number, required: true },
    isTrashMode: { type: Boolean, default: false },
};

ListTemplatesItemActions.emits = ['changed', 'error'];

export default ListTemplatesItemActions;
