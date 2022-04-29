import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import useI18n from '@/hooks/vue/useI18n';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';

// @vue/component
const ParkForm = (props, { emit }) => {
    const { park, errors } = toRefs(props);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));
    const __ = useI18n();

    const handleSubmit = (e) => {
        e.preventDefault();
        emit('submit', getFormDataAsJson(e.target));
    };

    const handleChange = (e) => {
        const { form } = e.target;
        emit('change', getFormDataAsJson(form));
    };

    const handleCancel = () => {
        emit('cancel');
    };

    return () => (
        <form
            class="Form Form--fixed-actions ParkForm"
            onSubmit={handleSubmit}
            onChange={handleChange}
        >
            <Fieldset title={__('minimal-infos')} required>
                <FormField
                    value={park.value.name}
                    name="name"
                    label="name"
                    required
                    errors={errors.value.name}
                />
            </Fieldset>
            <Fieldset title={__('contact-details')}>
                <FormField
                    value={park.value.street}
                    name="street"
                    label="street"
                    errors={errors.value.street}
                />
                <FormField
                    value={park.value.postal_code}
                    name="postal_code"
                    label="postal-code"
                    class="ParkForm__postal-code"
                    errors={errors.value.postal_code}
                />
                <FormField
                    value={park.value.locality}
                    name="locality"
                    label="city"
                    errors={errors.value.locality}
                />
                <FormField
                    value={park.value.country_id}
                    name="country_id"
                    label="country"
                    type="select"
                    options={countriesOptions.value}
                    errors={errors.value.country_id}
                    placeholder
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    value={park.value.opening_hours}
                    name="opening_hours"
                    label="opening-hours"
                    errors={errors.value.opening_hours}
                />
                <FormField
                    value={park.value.note}
                    name="note"
                    label="notes"
                    type="textarea"
                    errors={errors.value.note}
                />
            </Fieldset>
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

ParkForm.props = {
    park: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
};

export default ParkForm;
