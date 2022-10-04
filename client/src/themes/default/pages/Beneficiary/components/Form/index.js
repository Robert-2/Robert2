import './index.scss';
import { provide, computed, toRefs, ref } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import pick from 'lodash/pick';
import useI18n from '@/hooks/vue/useI18n';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';
import CompanySelect from './CompanySelect';

const DEFAULT_VALUES = Object.freeze({
    first_name: '',
    last_name: '',
    reference: '',
    company_id: '',
    company: null,
    phone: '',
    email: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: '',
    note: '',
});

// @vue/component
const BeneficiaryEditForm = (props, { emit }) => {
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

    const handleChange = () => {
        emit('change', { ...data.value });
    };

    const handleChangeCompany = (companyId) => {
        data.value.company_id = companyId || null;
        emit('change', { ...data.value });
    };

    const handleCancel = () => {
        emit('cancel');
    };

    return () => (
        <form
            class="Form Form--fixed-actions BeneficiaryEditForm"
            onSubmit={handleSubmit}
            onChange={handleChange}
        >
            <Fieldset>
                <div class="BeneficiaryEditForm__name">
                    <FormField
                        label="first-name"
                        class="BeneficiaryEditForm__first-name"
                        v-model={data.value.first_name}
                        errors={errors.value?.first_name}
                        autocomplete="off"
                        required
                    />
                    <FormField
                        label="last-name"
                        class="BeneficiaryEditForm__last-name"
                        v-model={data.value.last_name}
                        errors={errors.value?.last_name}
                        autocomplete="off"
                        required
                    />
                </div>
                <FormField
                    label="reference"
                    v-model={data.value.reference}
                    errors={errors.value?.reference}
                    help={__('page.beneficiary.help-reference')}
                />
            </Fieldset>
            <Fieldset title={__('company')}>
                <CompanySelect
                    defaultCompany={data.value.company ?? null}
                    onChange={handleChangeCompany}
                />
            </Fieldset>
            <Fieldset title={__('contact-details')}>
                <FormField
                    label="phone"
                    type="tel"
                    autocomplete="off"
                    v-model={data.value.phone}
                    errors={errors.value?.phone}
                />
                <FormField
                    label="email"
                    type="email"
                    autocomplete="off"
                    v-model={data.value.email}
                    errors={errors.value?.email}
                />
                <FormField
                    label="street"
                    autocomplete="off"
                    v-model={data.value.street}
                    errors={errors.value?.street}
                />
                <div class="BeneficiaryEditForm__locality">
                    <FormField
                        label="postal-code"
                        class="BeneficiaryEditForm__postal-code"
                        autocomplete="off"
                        v-model={data.value.postal_code}
                        errors={errors.value?.postal_code}
                    />
                    <FormField
                        label="city"
                        class="BeneficiaryEditForm__city"
                        autocomplete="off"
                        v-model={data.value.locality}
                        errors={errors.value?.locality}
                    />
                </div>
                <FormField
                    label="country"
                    type="select"
                    autocomplete="off"
                    options={countriesOptions.value}
                    v-model={data.value.country_id}
                    errors={errors.value?.country_id}
                    onChange={handleChange}
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    label="notes"
                    type="textarea"
                    rows={5}
                    v-model={data.value.note}
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

BeneficiaryEditForm.props = {
    savedData: { type: Object, default: () => ({}) },
    isSaving: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
};

export default BeneficiaryEditForm;
