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

// TODO: Mise en forme du formulaire (code postal / localité, etc), cf. beneficiaires.

const DEFAULT_VALUES = Object.freeze({
    first_name: '',
    last_name: '',
    nickname: '',
    phone: '',
    email: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: '',
    note: '',
});

// @vue/component
const TechnicianEditForm = (props, { emit }) => {
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
        <form class="Form Form--fixed-actions TechnicianEditForm" onSubmit={handleSubmit}>
            <Fieldset>
                <div class="TechnicianEditForm__name">
                    <FormField
                        label="first-name"
                        class="TechnicianEditForm__first-name"
                        v-model={data.value.first_name}
                        errors={errors.value?.first_name}
                        autocomplete="off"
                        required
                    />
                    <FormField
                        label="last-name"
                        class="TechnicianEditForm__last-name"
                        v-model={data.value.last_name}
                        errors={errors.value?.last_name}
                        autocomplete="off"
                        required
                    />
                </div>
                <FormField
                    label="nickname"
                    v-model={data.value.nickname}
                    errors={errors.value?.nickname}
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
                <div class="TechnicianEditForm__locality">
                    <FormField
                        label="postal-code"
                        class="TechnicianEditForm__postal-code"
                        autocomplete="off"
                        v-model={data.value.postal_code}
                        errors={errors.value?.postal_code}
                    />
                    <FormField
                        label="city"
                        class="TechnicianEditForm__city"
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
                    label="notes"
                    type="textarea"
                    rows={5}
                    class="TechnicianEditForm__notes"
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

TechnicianEditForm.props = {
    savedData: { type: Object, default: () => ({}) },
    isSaving: { type: Boolean, default: false },
    errors: { type: Object, default: () => ({}) },
};

export default TechnicianEditForm;
