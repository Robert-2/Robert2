import './index.scss';
import { defineComponent } from '@vue/composition-api';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Options } from '@/utils/formatOptions';
import type { Country } from '@/stores/api/countries';
import type { Technician, TechnicianEdit } from '@/stores/api/technicians';

type Props = {
    /** Les données déjà sauvegardées du technicien (s'il existait déjà). */
    savedData?: Technician | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<keyof TechnicianEdit, string[]>,
};

type Data = {
    data: TechnicianEdit,
};

const DEFAULT_VALUES: TechnicianEdit = Object.freeze({
    first_name: '',
    last_name: '',
    nickname: '',
    phone: '',
    email: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: null,
    note: '',
});

/** Formulaire d'édition d'un technicien. */
const TechnicianEditForm = defineComponent({
    name: 'TechnicianEditForm',
    provide: {
        verticalForm: true,
    },
    props: {
        savedData: {
            type: Object as PropType<Required<Props>['savedData']>,
            default: null,
        },
        isSaving: {
            type: Boolean as PropType<Required<Props>['isSaving']>,
            default: false,
        },
        errors: {
            type: Object as PropType<Required<Props>['errors']>,
            default: null,
        },
    },
    emits: ['submit', 'cancel'],
    data(): Data {
        const data = {
            ...DEFAULT_VALUES,
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
        };

        return { data };
    },
    computed: {
        countriesOptions(): Options<Country> {
            return this.$store.getters['countries/options'];
        },
    },
    created() {
        this.$store.dispatch('countries/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e?.preventDefault();

            this.$emit('submit', cloneDeep(this.data));
        },

        handleCancel() {
            this.$emit('cancel');
        },
    },
    render() {
        const {
            $t: __,
            data,
            errors,
            countriesOptions,
            isSaving,
            handleSubmit,
            handleCancel,
        } = this;

        return (
            <form
                class="Form Form--fixed-actions TechnicianEditForm"
                onSubmit={handleSubmit}
            >
                <Fieldset>
                    <div class="TechnicianEditForm__name">
                        <FormField
                            label="first-name"
                            class="TechnicianEditForm__first-name"
                            v-model={data.first_name}
                            errors={errors?.first_name}
                            autocomplete="off"
                            required
                        />
                        <FormField
                            label="last-name"
                            class="TechnicianEditForm__last-name"
                            v-model={data.last_name}
                            errors={errors?.last_name}
                            autocomplete="off"
                            required
                        />
                    </div>
                    <FormField
                        label="nickname"
                        v-model={data.nickname}
                        errors={errors?.nickname}
                    />
                </Fieldset>
                <Fieldset title={__('contact-details')}>
                    <FormField
                        label="phone"
                        type="tel"
                        autocomplete="off"
                        v-model={data.phone}
                        errors={errors?.phone}
                    />
                    <FormField
                        label="email"
                        type="email"
                        autocomplete="off"
                        v-model={data.email}
                        errors={errors?.email}
                    />
                    <FormField
                        label="street"
                        autocomplete="off"
                        v-model={data.street}
                        errors={errors?.street}
                    />
                    <div class="TechnicianEditForm__locality">
                        <FormField
                            label="postal-code"
                            class="TechnicianEditForm__postal-code"
                            autocomplete="off"
                            v-model={data.postal_code}
                            errors={errors?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="TechnicianEditForm__city"
                            autocomplete="off"
                            v-model={data.locality}
                            errors={errors?.locality}
                        />
                    </div>
                    <FormField
                        label="country"
                        type="select"
                        autocomplete="off"
                        options={countriesOptions}
                        v-model={data.country_id}
                        errors={errors?.country_id}
                    />
                </Fieldset>
                <Fieldset title={__('other-infos')}>
                    <FormField
                        label="notes"
                        type="textarea"
                        rows={5}
                        class="TechnicianEditForm__notes"
                        v-model={data.note}
                        errors={errors?.note}
                    />
                </Fieldset>
                <section class="Form__actions">
                    <Button htmlType="submit" type="primary" icon="save" loading={isSaving}>
                        {isSaving ? __('saving') : __('save')}
                    </Button>
                    <Button icon="ban" onClick={handleCancel}>
                        {__('cancel')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default TechnicianEditForm;
