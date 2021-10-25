import './index.scss';
import { toRefs, ref } from '@vue/composition-api';
import requester from '@/globals/requester';
import useI18n from '@/hooks/useI18n';
import { getValidationErrors } from '@/utils/errors';
import FormField from '@/components/FormField';
import ListTemplateTotals from '@/components/ListTemplateTotals';
import { getMaterialsQuantities } from '@/components/MaterialsListEditor/_utils';

import type { Component, SetupContext } from '@vue/composition-api';
import type { FormErrorDetail } from '@/stores/api/@types';
import type { MaterialWithPivot } from '@/stores/api/materials';

type Props = {
    materials: MaterialWithPivot[],
};

// @vue/component
const ListTemplateFromEvent: Component<Props> = (props: Props, { root, emit }: SetupContext) => {
    const __ = useI18n();
    const { materials } = toRefs(props);
    const name = ref<string>('');
    const description = ref<string>('');
    const isSaving = ref<boolean>(false);
    const errors = ref<FormErrorDetail | null>(null);

    const handleSubmit = async (): Promise<void> => {
        errors.value = null;
        isSaving.value = true;

        const templateListData = {
            name: name.value,
            description: description.value,
            materials: getMaterialsQuantities(materials.value),
        };

        try {
            const { data } = await requester.post('list-templates', templateListData);
            root.$toasted.success(__('list-template-created', { name: data.name }));
            emit('close');
        } catch (err) {
            errors.value = getValidationErrors(err);
        } finally {
            isSaving.value = false;
        }
    };

    const handleClose = (): void => {
        emit('close');
    };

    return () => (
        <div class="ListTemplateFromEvent">
            <div class="ListTemplateFromEvent__header">
                <h2 class="ListTemplateFromEvent__header__title">
                    {__('create-list-template-from-event')}
                </h2>
                <button type="button" class="ListTemplateFromEvent__header__btn-close" onClick={handleClose}>
                    <i class="fas fa-times" />
                </button>
            </div>
            <div class="ListTemplateFromEvent__main">
                <FormField
                    vModel={name.value}
                    name="name"
                    label="name"
                    required
                    errors={errors.value?.name}
                />
                <FormField
                    vModel={description.value}
                    name="description"
                    label="description"
                    type="textarea"
                    errors={errors.value?.description}
                />
                <ListTemplateTotals materials={materials.value} />
            </div>
            <div class="ListTemplateFromEvent__footer">
                <button type="button" onClick={handleSubmit} class="success">
                    <i class="fas fa-check" /> {__('create-list-template')}
                </button>
                <button type="button" onClick={handleClose}>
                    <i class="fas fa-times" /> {__('close')}
                </button>
            </div>
        </div>
    );
};

ListTemplateFromEvent.props = {
    materials: { type: Array, required: true },
};

export default ListTemplateFromEvent;
