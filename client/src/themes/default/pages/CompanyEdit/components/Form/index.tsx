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
import type { Company, CompanyEdit } from '@/stores/api/companies';

type Props = {
    /** Les données déjà sauvegardées de la société (s'il existait déjà). */
    savedData?: Company | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<keyof CompanyEdit, string[]>,
};

type Data = {
    data: CompanyEdit,
};

const DEFAULT_VALUES: CompanyEdit = Object.freeze({
    legal_name: '',
    phone: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: null,
    note: '',
});

/** Formulaire d'édition d'une société. */
const CompanyEditForm = defineComponent({
    name: 'CompanyEditForm',
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
                class="Form Form--fixed-actions CompanyEditForm"
                onSubmit={handleSubmit}
            >
                <Fieldset>
                    <FormField
                        label="legal-name"
                        autocomplete="off"
                        v-model={data.legal_name}
                        errors={errors?.legal_name}
                        required
                    />
                    <FormField
                        label="phone"
                        type="tel"
                        autocomplete="off"
                        v-model={data.phone}
                        errors={errors?.phone}
                    />
                </Fieldset>
                <Fieldset title={__('address')}>
                    <FormField
                        label="street"
                        autocomplete="off"
                        v-model={data.street}
                        errors={errors?.street}
                    />
                    <div class="CompanyEditForm__locality">
                        <FormField
                            label="postal-code"
                            autocomplete="off"
                            class="CompanyEditForm__postal-code"
                            v-model={data.postal_code}
                            errors={errors?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="CompanyEditForm__city"
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
                        v-model={data.note}
                        label="notes"
                        rows={5}
                        type="textarea"
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

export default CompanyEditForm;
