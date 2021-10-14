import { toRefs, ref, computed } from '@vue/composition-api';
import Config from '@/globals/config';
import requester from '@/globals/requester';
import useI18n from '@/hooks/useI18n';
import { confirm } from '@/utils/alert';

import type { Render, SetupContext } from '@vue/composition-api';

type Props = {
    id: number,
    materialId: number,
    onChange?(): void,
    onError?(error: unknown): void,
};

// @vue/component
const MaterialViewUnitActions = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { id, materialId } = toRefs(props);

    const isLoading = ref<boolean>(false);

    const fileUrl = computed<string>((): string => {
        const { baseUrl } = Config;
        return `${baseUrl}/material-units/${id.value}/barcode`;
    });

    const handleDelete = async (): Promise<void> => {
        const { value: isConfirmed } = await confirm({
            title: __('please-confirm'),
            text: __('page-material-units.confirm-permanently-delete'),
            confirmButtonText: __('yes-permanently-delete'),
            type: 'delete',
        });
        if (!isConfirmed) {
            return;
        }

        try {
            await requester.delete(`material-units/${id.value}`);
            emit('change', id.value);
        } catch (err) {
            emit('error', err);
        } finally {
            isLoading.value = false;
        }
    };

    return () => {
        if (isLoading.value) {
            return (
                <div class="MaterialViewUnitActions">
                    <i class="fas fa-spin fa-circle-notch" />
                </div>
            );
        }

        return (
            <div class="MaterialViewUnitActions">
                <a target="_blank" rel="noreferrer" href={fileUrl.value} class="item-actions__button info">
                    <i class="fas fa-barcode" />
                </a>
                <router-link
                    vTooltip={__('action-edit')}
                    to={`/materials/${materialId?.value}/units/${id.value}`}
                    custom
                >
                    {({ navigate }: { navigate(): void }) => (
                        <button type="button" class="item-actions__button info" onClick={navigate}>
                            <i class="fas fa-edit" />
                        </button>
                    )}
                </router-link>
                <button
                    vTooltip={__('action-delete')}
                    type="button"
                    class="item-actions__button danger"
                    onClick={handleDelete}
                >
                    <i class="fas fa-trash-alt" />
                </button>
            </div>
        );
    };
};

MaterialViewUnitActions.props = {
    id: { type: Number, required: true },
};

MaterialViewUnitActions.emits = ['change', 'error'];

export default MaterialViewUnitActions;
