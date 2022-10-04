import './index.scss';
import { provide, toRefs, computed, ref } from '@vue/composition-api';
import { useQuery } from 'vue-query';
import pick from 'lodash/pick';
import formatOptions from '@/utils/formatOptions';
import apiCountries from '@/stores/api/countries';
import useI18n from '@/hooks/vue/useI18n';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';

const DEFAULT_VALUES = Object.freeze({
    name: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: '',
    opening_hours: '',
    note: '',
});

// @vue/component
const ParkEditForm = (props, { emit }) => {
    const __ = useI18n();
    const { savedData, isSaving, errors } = toRefs(props);
    const { data: countries } = useQuery('countries', apiCountries.all);
    const countriesOptions = computed(() => formatOptions(countries.value ?? []));

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
        <form class="Form Form--fixed-actions ParkEditForm" onSubmit={handleSubmit}>
            <Fieldset>
                <FormField
                    label="name"
                    v-model={data.value.name}
                    errors={errors.value?.name}
                    required
                />
            </Fieldset>
            <Fieldset title={__('contact-details')}>
                <FormField
                    label="street"
                    autocomplete="off"
                    v-model={data.value.street}
                    errors={errors.value?.street}
                />
                <div class="ParkEditForm__locality">
                    <FormField
                        label="postal-code"
                        class="ParkEditForm__postal-code"
                        autocomplete="off"
                        v-model={data.value.postal_code}
                        errors={errors.value?.postal_code}
                    />
                    <FormField
                        label="city"
                        class="ParkEditForm__city"
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
                />
            </Fieldset>
            <Fieldset title={__('other-infos')}>
                <FormField
                    label="opening-hours"
                    v-model={data.value.opening_hours}
                    errors={errors.value?.opening_hours}
                />
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

ParkEditForm.props = {
    savedData: { type: Object, default: () => ({}) },
    isSaving: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
};

export default ParkEditForm;
