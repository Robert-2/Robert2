import './index.scss';
import { toRefs, provide, ref } from '@vue/composition-api';
import requester from '@/globals/requester';
import useI18n from '@/hooks/vue/useI18n';
import { getValidationErrors } from '@/utils/errors';
import { getMaterialsQuantities } from '@/themes/default/components/MaterialsListEditor';
import FormField from '@/themes/default/components/FormField';
import ListTemplateTotals from '@/themes/default/components/ListTemplateTotals';

// @vue/component
const ListTemplateFromEvent = (props, { root, emit }) => {
    const __ = useI18n();
    const { materials } = toRefs(props);
    const name = ref('');
    const description = ref('');
    const isSaving = ref(false);
    const errors = ref(null);

    // - Formulaire vertical.
    // TODO: À supprimer lorsque tout aura été migré.
    provide('verticalForm', true);

    const handleSubmit = async () => {
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

    const handleClose = () => {
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
                    v-model={name.value}
                    name="name"
                    label="name"
                    required
                    errors={errors.value?.name}
                />
                <FormField
                    v-model={description.value}
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
