import './index.scss';
import { computed, toRefs, ref, onMounted } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import pick from 'lodash/pick';
import useI18n from '@/hooks/vue/useI18n';
import useRouter from '@/hooks/vue/useRouter';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import Icon from '@/components/Icon';
import Button from '@/components/Button';
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
const BeneficiaryEditForm = (props, { root, emit }) => {
    const { savedData, isSaving, errors } = toRefs(props);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const { router } = useRouter();
    const __ = useI18n();

    const data = ref({
        ...DEFAULT_VALUES,
        ...pick(savedData.value ?? {}, Object.keys(DEFAULT_VALUES)),
    });

    onMounted(() => {
        root.$store.dispatch('companies/fetch');
    });

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
        router.back();
    };

    return () => (
        <form
            class="Form Form--fixed-actions BeneficiaryEditForm"
            method="POST"
            onSubmit={handleSubmit}
            onChange={handleChange}
        >
            <Fieldset title={__('personal-infos')}>
                <FormField
                    label="first-name"
                    v-model={data.value.first_name}
                    errors={errors.value?.first_name}
                    required
                />
                <FormField
                    label="last-name"
                    v-model={data.value.last_name}
                    errors={errors.value?.last_name}
                    required
                />
                <FormField
                    label="reference"
                    v-model={data.value.reference}
                    errors={errors.value?.reference}
                />
            </Fieldset>
            <Fieldset title={__('company')}>
                <CompanySelect
                    defaultCompany={data.value.company ?? null}
                    onChange={handleChangeCompany}
                />
                <router-link to={{ name: 'add-company' }} class="BeneficiaryEditForm__add-company">
                    <Icon name="plus" />&nbsp;{__('create-company')}
                </router-link>
            </Fieldset>
            <Fieldset title={__('contact')}>
                <FormField
                    label="phone"
                    class="BeneficiaryEditForm__phone"
                    type="tel"
                    v-model={data.value.phone}
                    errors={errors.value?.phone}
                />
                <FormField
                    label="email"
                    type="email"
                    v-model={data.value.email}
                    errors={errors.value?.email}
                />
                <FormField
                    label="street"
                    v-model={data.value.street}
                    errors={errors.value?.street}
                />
                <FormField
                    label="postal-code"
                    class="BeneficiaryEditForm__postal-code"
                    v-model={data.value.postal_code}
                    errors={errors.value?.postal_code}
                />
                <FormField
                    label="city"
                    v-model={data.value.locality}
                    errors={errors.value?.locality}
                />
                <FormField
                    label="country"
                    type="select"
                    options={countriesOptions.value}
                    v-model={data.value.country_id}
                    errors={errors.value?.country_id}
                    placeholder
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    label="notes"
                    type="textarea"
                    class="BeneficiaryEditForm__notes"
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
