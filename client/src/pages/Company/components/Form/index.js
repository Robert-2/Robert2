import './index.scss';
import { computed, toRefs, ref, provide } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import pick from 'lodash/pick';
import useI18n from '@/hooks/vue/useI18n';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import Button from '@/components/Button';

const DEFAULT_VALUES = Object.freeze({
    legal_name: '',
    phone: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: '',
    note: '',
});

// @vue/component
const CompanyEditForm = (props, { emit }) => {
    const { savedData, isSaving, errors } = toRefs(props);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const __ = useI18n();

    const data = ref({
        ...DEFAULT_VALUES,
        ...pick(savedData.value ?? {}, Object.keys(DEFAULT_VALUES)),
    });

    // - Formulaire vertical.
    // TODO: À supprimer lorsque tout aura été migré.
    provide('verticalForm', true);

    const handleSubmit = (e) => {
        e.preventDefault();

        emit('submit', { ...data.value });
    };

    const handleCancel = () => {
        emit('cancel');
    };

    return () => (
        <form class="Form Form--fixed-actions CompanyEditForm" onSubmit={handleSubmit}>
            <Fieldset>
                <FormField
                    label="legal-name"
                    autocomplete="off"
                    v-model={data.value.legal_name}
                    errors={errors.value?.legal_name}
                    required
                />
                <FormField
                    label="phone"
                    type="tel"
                    autocomplete="off"
                    v-model={data.value.phone}
                    errors={errors.value?.phone}
                />
            </Fieldset>
            <Fieldset title={__('address')}>
                <FormField
                    label="street"
                    autocomplete="off"
                    v-model={data.value.street}
                    errors={errors.value?.street}
                />
                <div class="CompanyEditForm__locality">
                    <FormField
                        label="postal-code"
                        autocomplete="off"
                        class="CompanyEditForm__postal-code"
                        v-model={data.value.postal_code}
                        errors={errors.value?.postal_code}
                    />
                    <FormField
                        label="city"
                        class="CompanyEditForm__city"
                        autocomplete="off"
                        v-model={data.value.locality}
                        errors={errors.value?.locality}
                    />
                </div>
                <FormField
                    label="country"
                    type="select"
                    autocomplete="off"
                    v-model={data.value.country_id}
                    options={countriesOptions.value}
                    errors={errors.value?.country_id}
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    v-model={data.value.note}
                    label="notes"
                    rows={5}
                    type="textarea"
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
