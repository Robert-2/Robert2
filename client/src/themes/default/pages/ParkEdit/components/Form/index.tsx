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
import type { Park, ParkEdit } from '@/stores/api/parks';

type Props = {
    /** Les données déjà sauvegardées du parc (s'il existait déjà). */
    savedData?: Park | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<keyof ParkEdit, string>,
};

type Data = {
    data: ParkEdit,
};

const DEFAULT_VALUES: ParkEdit = Object.freeze({
    name: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: null,
    opening_hours: '',
    note: '',
});

/** Formulaire d'édition d'un parc. */
const ParkEditForm = defineComponent({
    name: 'ParkEditForm',
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
                class="Form Form--fixed-actions ParkEditForm"
                onSubmit={handleSubmit}
            >
                <Fieldset>
                    <FormField
                        label="name"
                        v-model={data.name}
                        error={errors?.name}
                        required
                    />
                </Fieldset>
                <Fieldset title={__('contact-details')}>
                    <FormField
                        label="street"
                        autocomplete="off"
                        v-model={data.street}
                        error={errors?.street}
                    />
                    <div class="ParkEditForm__locality">
                        <FormField
                            label="postal-code"
                            class="ParkEditForm__postal-code"
                            autocomplete="off"
                            v-model={data.postal_code}
                            error={errors?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="ParkEditForm__city"
                            autocomplete="off"
                            v-model={data.locality}
                            error={errors?.locality}
                        />
                    </div>
                    <FormField
                        label="country"
                        type="select"
                        autocomplete="off"
                        options={countriesOptions}
                        v-model={data.country_id}
                        error={errors?.country_id}
                    />
                </Fieldset>
                <Fieldset title={__('other-infos')}>
                    <FormField
                        label="opening-hours"
                        v-model={data.opening_hours}
                        error={errors?.opening_hours}
                    />
                    <FormField
                        label="notes"
                        type="textarea"
                        rows={5}
                        v-model={data.note}
                        error={errors?.note}
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

export default ParkEditForm;
