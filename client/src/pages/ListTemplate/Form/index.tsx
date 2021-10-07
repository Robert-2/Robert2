import './index.scss';
import { toRefs, ref } from '@vue/composition-api';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import useI18n from '@/hooks/useI18n';
import FormField from '@/components/FormField';
import ListTemplateTotals from '@/components/ListTemplateTotals';
import MaterialsListEditor from '@/components/MaterialsListEditor';
import { getMaterialsQuantities, materialsHasChanged } from '@/components/MaterialsListEditor/_utils';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';
import type { MaterialQuantity } from '@/components/MaterialsListEditor/_utils';

type Props = {
    listTemplate: ListTemplateWithMaterial | null | undefined,
    errors: Record<string, string | null> | undefined,
    onSubmit(data: Record<string, string | MaterialQuantity>): void,
    onChange?(data: Record<string, string | MaterialQuantity>): void,
    onCancel(): void,
};

// @vue/component
const ListTemplateForm = (props: Props, { emit }: SetupContext): Render => {
    const { listTemplate, errors } = toRefs(props);
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
            formValues.name !== (listTemplate.value?.name || '') ||
            formValues.description !== (listTemplate.value?.description || '')
        );
        emit('change', getPostData());
    };

    const handleListChange = (newList: MaterialQuantity[]): void => {
        materialsQuantities.value = newList;

        const savedList = getMaterialsQuantities(listTemplate.value?.materials || []);
        hasChanged.value = materialsHasChanged(savedList, newList);

        emit('change', getPostData());
    };

    const handleCancel = (): void => {
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
                    value={listTemplate.value?.name}
                    name="name"
                    label="name"
                    required
                    errors={errors?.value?.name}
                />
                <FormField
                    value={listTemplate.value?.description}
                    name="description"
                    label="description"
                    type="textarea"
                    errors={errors?.value?.description}
                />
                <ListTemplateTotals
                    materials={listTemplate.value?.materials || []}
                />
                {hasChanged.value && (
                    <div class="ListTemplateForm__infos__not-saved">
                        <i class="fas fa-exclamation-triangle" /> {__('page-list-templates.not-saved')}
                    </div>
                )}
            </section>
            <section class="ListTemplateForm__materials">
                <MaterialsListEditor
                    selectedMaterials={listTemplate.value?.materials || []}
                    onChange={handleListChange}
                />
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
    listTemplate: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
};

ListTemplateForm.emits = ['change', 'submit', 'cancel'];

export default ListTemplateForm;
