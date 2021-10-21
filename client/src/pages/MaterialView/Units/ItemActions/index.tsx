import './index.scss';
import { toRefs, ref, computed } from '@vue/composition-api';
import Config from '@/globals/config';
import requester from '@/globals/requester';
import useI18n from '@/hooks/useI18n';
import { confirm } from '@/utils/alert';

import type { RouterLinkRenderFunctionArgs } from '@/globals/types/router-link';
import type { Render, SetupContext } from '@vue/composition-api';
import type { MaterialUnit } from '@/stores/api/materials';

type Props = {
    unit: MaterialUnit,
    onChange?(): void,
    onError?(error: unknown): void,
};

// @vue/component
const MaterialViewUnitActions = (props: Props, { emit }: SetupContext): Render => {
    const __ = useI18n();
    const { unit } = toRefs(props);

    const isLoading = ref<boolean>(false);

    const fileUrl = computed<string>((): string => {
        const { baseUrl } = Config;
        return `${baseUrl}/material-units/${unit.value.id}/barcode`;
    });

    const used = computed<boolean>(() => (
        (unit.value.usedBy?.events?.length || 0) > 0 ||
        (unit.value.usedBy?.listTemplates?.length || 0) > 0
    ));

    const handleDelete = async (): Promise<void> => {
        const confirmContent = {
            title: __('please-confirm'),
            text: __('page-material-units.confirm-permanently-delete'),
            confirmButtonText: __('yes-permanently-delete'),
            type: 'delete',
        };

        if (used.value) {
            const { events, listTemplates } = unit.value.usedBy || { events: [''], listTemplates: [''] };
            confirmContent.title = __('page-material-units.caution-used');

            confirmContent.text = __('page-material-units.used-in');
            if (events.length > 0) {
                confirmContent.text += `\n\n${__(
                    'page-material-units.events-list',
                    { items: events.slice(0, 4).join('", "'), count: events.length },
                    events.length,
                )}`;
            }
            if (listTemplates.length > 0) {
                confirmContent.text += `\n\n${__(
                    'page-material-units.list-templates-list',
                    { items: listTemplates.slice(0, 4).join('", "'), count: listTemplates.length },
                    listTemplates.length,
                )}`;
            }
            confirmContent.text += `\n\n${__('page-material-units.deleting-will-set-as-external')}`;

            confirmContent.confirmButtonText = __('page-material-units.permanently-delete-anyway');
        }

        const { value: isConfirmed } = await confirm(confirmContent);
        if (!isConfirmed) {
            return;
        }

        try {
            isLoading.value = true;
            await requester.delete(`material-units/${unit.value.id}`);
            emit('change', unit.value.id);
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
                    <div class="MaterialViewUnitActions__loading">
                        <i class="fas fa-spin fa-circle-notch fa-2x" />
                    </div>
                </div>
            );
        }

        return (
            <div class="MaterialViewUnitActions">
                <a
                    target="_blank"
                    rel="noreferrer"
                    download
                    href={fileUrl.value}
                    vTooltip={__('download-barcode')}
                    class="button item-actions__button info"
                >
                    <i class="fas fa-barcode" />
                </a>
                <router-link
                    vTooltip={__('action-edit')}
                    to={`/materials/${unit.value.material_id}/units/${unit.value.id}`}
                    custom
                >
                    {({ navigate }: RouterLinkRenderFunctionArgs) => (
                        <button type="button" class="item-actions__button info" onClick={navigate}>
                            <i class="fas fa-edit" />
                        </button>
                    )}
                </router-link>
                <button
                    vTooltip_left={__('action-delete')}
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
    unit: { type: Object, required: true },
};

MaterialViewUnitActions.emits = ['change', 'error'];

export default MaterialViewUnitActions;
