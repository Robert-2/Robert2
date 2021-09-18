import './index.scss';
import { computed, toRefs } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import FormField from '@/components/FormField';

import type { Render, SetupContext } from '@vue/composition-api';

type Props = {
    company: Record<string, any>,
    errors: Record<string, any>,
};

// @vue/component
const CompanyForm = (props: Props, { emit }: SetupContext): Render => {
    const { company, errors } = toRefs(props);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const { router } = useRouter();
    const __ = useI18n();

    const handleSubmit = (e: SubmitEvent): void => {
        e.preventDefault();
        emit('submit', getFormDataAsJson(e.target));
    };

    const handleCancel = (): void => {
        router.back();
    };

    return () => (
        <form class="Form Form--fixed-actions CompanyForm" onSubmit={handleSubmit}>
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('informations')}</h4>
                <FormField
                    value={company.value.legal_name}
                    name="legal_name"
                    label="legal-name"
                    required
                    errors={errors.value.legal_name}
                />
                <FormField
                    value={company.value.phone}
                    name="phone"
                    label="phone"
                    class="CompanyForm__phone"
                    type="tel"
                    errors={errors.value.phone}
                />
            </section>
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('address')}</h4>
                <FormField
                    value={company.value.street}
                    name="street"
                    label="street"
                    errors={errors.value.street}
                />
                <FormField
                    value={company.value.postal_code}
                    name="postal_code"
                    label="postal-code"
                    class="CompanyForm__postal-code"
                    errors={errors.value.postal_code}
                />
                <FormField
                    value={company.value.locality}
                    name="locality"
                    label="city"
                    errors={errors.value.locality}
                />
                <FormField
                    value={company.value.country_id}
                    name="country_id"
                    label="country"
                    type="select"
                    options={countriesOptions.value}
                    errors={errors.value.country_id}
                    placeholder
                />
            </section>
            <section class="Form__fieldset">
                <h4 class="Form__fieldset__title">{__('other-infos')}</h4>
                <FormField
                    value={company.value.note}
                    label="notes"
                    name="note"
                    type="textarea"
                    class="CompanyForm__notes"
                    errors={errors.value.note}
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

CompanyForm.props = {
    company: { type: Object, required: true },
    errors: { type: Object, default: () => ({}) },
};

export default CompanyForm;
