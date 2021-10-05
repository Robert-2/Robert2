import './index.scss';
import { toRefs } from '@vue/composition-api';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import useI18n from '@/hooks/useI18n';
import FormField from '@/components/FormField';
import ListTemplateTotals from '@/components/ListTemplateTotals';
import MaterialsList from '@/pages/Event/Step4/MaterialsList';

import type { Render, SetupContext } from '@vue/composition-api';
import type { ListTemplateWithMaterial } from '@/stores/api/list-templates';

type Props = {
    listTemplate: ListTemplateWithMaterial | null | undefined,
    errors: Record<string, string | null> | undefined,
    onSubmit(data: Record<string, string>): void,
    onChange(data: Record<string, string>): void,
    onCancel(): void,
};

// @vue/component
const ListTemplateForm = (props: Props, { emit }: SetupContext): Render => {
    const { listTemplate, errors } = toRefs(props);
    const __ = useI18n();

    const handleSubmit = (e: SubmitEvent): void => {
        e.preventDefault();
        emit('submit', getFormDataAsJson(e.target));
    };

    const handleChange = (e: Event): void => {
        const { form } = e.target as HTMLInputElement;
        emit('change', getFormDataAsJson(form));
    };

    const handleCancel = (): void => {
        emit('cancel');
    };

    return () => (
        <form
            class="Form Form--fixed-actions ListTemplateForm"
            onSubmit={handleSubmit}
            onChange={handleChange}
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
            </section>
            <section class="ListTemplateForm__materials">
                <pre>{JSON.stringify(listTemplate.value?.materials || [], undefined, 2)}</pre>
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
