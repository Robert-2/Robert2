import './index.scss';
import { computed, toRefs, ref, onMounted } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import useI18n from '@/hooks/vue/useI18n';
import useRouter from '@/hooks/vue/useRouter';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import CompanySelect from './CompanySelect';

// @vue/component
const PersonForm = (props, { root, emit }) => {
    const { initialData, isSaving, errors, withReference, withCompany } = toRefs(props);
    const person = ref(initialData.value);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const { router } = useRouter();
    const __ = useI18n();

    onMounted(() => {
        root.$store.dispatch('companies/fetch');
    });

    const handleSubmit = (e) => {
        emit('submit', e);
    };

    const handleChange = () => {
        emit('change', person.value);
    };

    const handleChangeCompany = (companyId) => {
        person.value.company_id = companyId || null;
        emit('change', person.value);
    };

    const handleCancel = () => {
        emit('cancel');
        router.back();
    };

    return () => (
        <form
            class="Form Form--fixed-actions PersonForm"
            method="POST"
            onSubmit={handleSubmit}
            onChange={handleChange}
        >
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('personal-infos')}</h4>
                <FormField
                    name="first_name"
                    label="first-name"
                    vModel={person.value.first_name}
                    errors={errors.value.first_name}
                    required
                />
                <FormField
                    name="last_name"
                    label="last-name"
                    vModel={person.value.last_name}
                    errors={errors.value.last_name}
                    required
                />
                {withReference.value && (
                    <FormField
                        name="reference"
                        label="reference"
                        vModel={person.value.reference}
                        errors={errors.value.reference}
                    />
                )}
                {!withCompany.value && (
                    <FormField
                        name="nickname"
                        label="nickname"
                        vModel={person.value.nickname}
                        errors={errors.value.nickname}
                    />
                )}
            </section>
            {withCompany.value && (
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('company')}</h4>
                    <CompanySelect
                        defaultCompany={person.value.company || null}
                        onChange={handleChangeCompany}
                    />
                    <router-link to="/companies/new" class="PersonForm__add-company">
                        <i class="fas fa-plus" /> {__('page-companies.create-new')}
                    </router-link>
                </section>
            )}
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('contact')}</h4>
                <FormField
                    name="phone"
                    label="phone"
                    class="PersonForm__phone"
                    type="tel"
                    vModel={person.value.phone}
                    errors={errors.value.phone}
                />
                <FormField
                    name="email"
                    label="email"
                    type="email"
                    vModel={person.value.email}
                    errors={errors.value.email}
                />
                <FormField
                    name="street"
                    label="street"
                    vModel={person.value.street}
                    errors={errors.value.street}
                />
                <FormField
                    name="postal_code"
                    label="postal-code"
                    class="PersonForm__postal-code"
                    vModel={person.value.postal_code}
                    errors={errors.value.postal_code}
                />
                <FormField
                    name="locality"
                    label="city"
                    vModel={person.value.locality}
                    errors={errors.value.locality}
                />
                <FormField
                    name="country_id"
                    label="country"
                    type="select"
                    options={countriesOptions.value}
                    vModel={person.value.country_id}
                    errors={errors.value.country_id}
                    placeholder
                />
            </section>
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('other-infos')}</h4>
                <FormField
                    label="notes"
                    name="note"
                    type="textarea"
                    class="PersonForm__notes"
                    vModel={person.value.note}
                    errors={errors.value.note}
                />
            </section>
            <section class="Form__actions">
                <Button htmlType="submit" type="success" icon="save" loading={isSaving.value}>
                    {isSaving.value ? __('saving') : __('save')}
                </Button>
                <Button icon="ban" onClick={handleCancel}>
                    {__('cancel')}
                </Button>
            </section>
        </form>
    );
};

PersonForm.props = {
    initialData: { type: Object, default: () => ({}) },
    isSaving: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
    withCompany: Boolean,
    withReference: Boolean,
};

export default PersonForm;
