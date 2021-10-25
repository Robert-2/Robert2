import './index.scss';
import { toRefs, ref } from '@vue/composition-api';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import useI18n from '@/hooks/useI18n';
import { confirm } from '@/utils/alert';
import FormField from '@/components/FormField';
import ListTemplateTotals from '@/components/ListTemplateTotals';
import MaterialsListEditor from '@/components/MaterialsListEditor';
import { getMaterialsQuantities, materialsHasChanged } from '@/components/MaterialsListEditor/_utils';

import type { Component, SetupContext } from '@vue/composition-api';
import type { FormErrorDetail } from '@/stores/api/@types';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';
import type { MaterialQuantity } from '@/components/MaterialsListEditor/_utils';

type Props = {
    isNew: boolean,
    data: ListTemplateWithMaterial | null | undefined,
    errors: FormErrorDetail | null | undefined,
    onSubmit(data: Record<string, string | MaterialQuantity>): void,
    onChange?(data: Record<string, string | MaterialQuantity>): void,
    onCancel(): void,
};

// @vue/component
const ListTemplateForm: Component<Props> = (props: Props, { emit }: SetupContext) => {
    const { isNew, data, errors } = toRefs(props);
    const __ = useI18n();

    const formRef = ref<HTMLFormElement | null>(null);
    const materialsQuantities = ref<MaterialQuantity[]>([]);
    const hasChanged = ref<boolean>(false);

    const getPostData = (): Record<string, string | MaterialQuantity> => {
        const postData = getFormDataAsJson(formRef.value);
        postData.materials = materialsQuantities.value;
        return postData;
    };

    const handleSubmit = (e: SubmitEvent): void => {
        e.preventDefault();
        emit('submit', getPostData());
    };

    const handleFormChange = (): void => {
        const formValues = getFormDataAsJson(formRef.value);
        hasChanged.value = (
            formValues.name !== (data.value?.name || '') ||
            formValues.description !== (data.value?.description || '')
        );
        emit('change', getPostData());
    };

    const handleListChange = (newList: MaterialQuantity[]): void => {
        materialsQuantities.value = newList;

        const savedList = getMaterialsQuantities(data.value?.materials || []);
        hasChanged.value = materialsHasChanged(savedList, newList);

        emit('change', getPostData());
    };

    const handleCancel = async (): Promise<void> => {
        if (hasChanged.value) {
            const { isConfirmed } = await confirm({
                title: __('please-confirm'),
                text: __('changes-exists-really-cancel'),
                confirmButtonText: __('yes-leave-page'),
                type: 'trash',
            });
            if (!isConfirmed) {
                return;
            }
        }

        emit('cancel');
    };

    return () => (
        <form
            ref={formRef}
            class="Form Form--fixed-actions ListTemplateForm"
            onSubmit={handleSubmit}
            onChange={handleFormChange}
        >
            <section class="ListTemplateForm__infos">
                <FormField
                    value={data.value?.name}
                    name="name"
                    label="name"
                    required
                    errors={errors?.value?.name}
                />
                <FormField
                    value={data.value?.description}
                    name="description"
                    label="description"
                    type="textarea"
                    errors={errors?.value?.description}
                />
                <ListTemplateTotals
                    materials={data.value?.materials || []}
                />
                {hasChanged.value && (
                    <div class="ListTemplateForm__infos__not-saved">
                        <i class="fas fa-exclamation-triangle" /> {__('page-list-templates.not-saved')}
                    </div>
                )}
            </section>
            <section class="ListTemplateForm__materials">
                {isNew.value && (
                    <MaterialsListEditor onChange={handleListChange} />
                )}
                {!isNew.value && data.value?.materials && (
                    <MaterialsListEditor
                        selected={data.value.materials}
                        onChange={handleListChange}
                    />
                )}
            </section>
            <section class="Form__actions">
                <button class="Form__actions__save success" type="submit">
                    <i class="fas fa-save" /> {__('save')}
                </button>
                <button type="button" onClick={handleCancel}>
                    <i class="fas fa-ban" /> {__('cancel')}
                </button>
            </section>
        </form>
    );
};

ListTemplateForm.props = {
    isNew: { type: Boolean, required: true },
    data: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
};

ListTemplateForm.emits = ['change', 'submit', 'cancel'];

export default ListTemplateForm;
