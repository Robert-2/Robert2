import './index.scss';
import { computed, toRefs, ref, provide } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import useI18n from '@/hooks/vue/useI18n';
import useRouter from '@/hooks/vue/useRouter';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import Button from '@/components/Button';

// @vue/component
const CompanyEditForm = (props, { emit }) => {
    const { savedData, isSaving, errors } = toRefs(props);
    const data = ref({ ...(savedData.value ?? {}) });
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const { router } = useRouter();
    const __ = useI18n();

    // - Formulaire vertical.
    // TODO: À supprimer lorsque tout aura été migré.
    provide('verticalForm', true);

    const handleSubmit = (e) => {
        e.preventDefault();

        emit('submit', getFormDataAsJson(e.target));
    };

    const handleCancel = () => {
        router.back();
    };

    return () => (
        <form class="Form Form--fixed-actions CompanyEditForm" onSubmit={handleSubmit}>
            <Fieldset>
                <FormField
                    name="legal_name"
                    label="legal-name"
                    autocomplete="off"
                    v-model={data.value.legal_name}
                    errors={errors.value?.legal_name}
                    required
                />
                <FormField
                    name="phone"
                    label="phone"
                    type="tel"
                    autocomplete="off"
                    v-model={data.value.phone}
                    errors={errors.value?.phone}
                />
            </Fieldset>
            <Fieldset title={__('address')}>
                <FormField
                    name="street"
                    label="street"
                    autocomplete="off"
                    v-model={data.value.street}
                    errors={errors.value?.street}
                />
                <div class="CompanyEditForm__locality">
                    <FormField
                        name="postal_code"
                        label="postal-code"
                        autocomplete="off"
                        class="CompanyEditForm__postal-code"
                        v-model={data.value.postal_code}
                        errors={errors.value?.postal_code}
                    />
                    <FormField
                        name="locality"
                        label="city"
                        class="CompanyEditForm__city"
                        autocomplete="off"
                        v-model={data.value.locality}
                        errors={errors.value?.locality}
                    />
                </div>
                <FormField
                    name="country_id"
                    label="country"
                    type="select"
                    autocomplete="off"
                    v-model={data.value.country_id}
                    options={countriesOptions.value}
                    errors={errors.value?.country_id}
                    placeholder
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    v-model={data.value.note}
                    label="notes"
                    name="note"
                    type="textarea"
                    class="CompanyEditForm__notes"
                    errors={errors.value?.note}
                />
            </Fieldset>
            <section class="Form__actions">
                <Button htmlType="submit" type="primary" icon="save" loading={isSaving.value}>
                    {isSaving.value ? __('saving') : __('save')}
                </Button>
                <Button icon="ban" onClick={handleCancel}>
                    {__('cancel')}
                </Button>
            </section>
        </form>
    );
};

CompanyEditForm.props = {
    savedData: { type: Object, default: () => ({}) },
    isSaving: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
};

export default CompanyEditForm;
