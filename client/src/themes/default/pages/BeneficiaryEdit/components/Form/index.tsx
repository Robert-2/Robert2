import './index.scss';
import { defineComponent } from '@vue/composition-api';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { Group } from '@/stores/api/groups';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';
import CompanySelect from './CompanySelect';

import type { PropType } from '@vue/composition-api';
import type { Options } from '@/utils/formatOptions';
import type { Country } from '@/stores/api/countries';
import type { Company } from '@/stores/api/companies';
import type {
    BeneficiaryEdit,
    BeneficiaryDetails as Beneficiary,
} from '@/stores/api/beneficiaries';

type Props = {
    /** Les données déjà sauvegardées du bénéficiaire (s'il existait déjà). */
    savedData?: Beneficiary | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<keyof BeneficiaryEdit, string[]>,
};

type Data = {
    data: BeneficiaryEdit,
};

const DEFAULT_VALUES: BeneficiaryEdit = Object.freeze({
    first_name: '',
    last_name: '',
    reference: '',
    company_id: null,
    phone: '',
    email: '',
    street: '',
    postal_code: '',
    locality: '',
    country_id: null,
    note: '',
    pseudo: '',
    password: '',
});

/** Formulaire d'édition d'un bénéficiaire. */
const BeneficiaryEditForm = defineComponent({
    name: 'BeneficiaryEditForm',
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
    emits: ['change', 'cancel', 'submit'],
    data(): Data {
        const data = {
            ...DEFAULT_VALUES,
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
            email: this.savedData?.user?.email ?? this.savedData?.email ?? null,
        };

        return { data };
    },
    computed: {
        isAdmin(): boolean {
            return this.$store.getters['auth/is'](Group.ADMIN);
        },

        hasUserAccount(): boolean {
            return !!this.savedData?.user;
        },

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

        handleChange() {
            this.$emit('change', cloneDeep(this.data));
        },

        handleChangeCompany(companyId: Company['id'] | null) {
            this.data.company_id = companyId || null;
            this.$emit('change', cloneDeep(this.data));
        },

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
            savedData,
            countriesOptions,
            hasUserAccount,
            isSaving,
            handleChange,
            handleChangeCompany,
            handleSubmit,
            handleCancel,
        } = this;

        const renderUserAccountSection = (): JSX.Element | null => {
            if (!hasUserAccount) {
                return null;
            }
            const user = savedData!.user!;

            return (
                <Fieldset title={__('page.beneficiary-edit.user-account')}>
                    <div class="BeneficiaryEditForm__existing-user-help">
                        {__('page.beneficiary-edit.existing-user-help')}
                    </div>
                    <div class="BeneficiaryEditForm__existing-user">
                        <div class="BeneficiaryEditForm__existing-user__pseudo">
                            <div class="BeneficiaryEditForm__existing-user__label">
                                {__('pseudo')}
                            </div>
                            <div class="BeneficiaryEditForm__existing-user__value">
                                {user.pseudo}
                            </div>
                        </div>
                        <div class="BeneficiaryEditForm__existing-user__email">
                            <div class="BeneficiaryEditForm__existing-user__label">
                                {__('email')}
                            </div>
                            <div class="BeneficiaryEditForm__existing-user__value">
                                {user.email}
                            </div>
                        </div>
                    </div>
                </Fieldset>
            );
        };

        return (
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
                            v-model={data.first_name}
                            errors={errors?.first_name}
                            autocomplete="off"
                            required
                        />
                        <FormField
                            label="last-name"
                            class="BeneficiaryEditForm__last-name"
                            v-model={data.last_name}
                            errors={errors?.last_name}
                            autocomplete="off"
                            required
                        />
                    </div>
                    <FormField
                        label="reference"
                        v-model={data.reference}
                        errors={errors?.reference}
                        help={__('page.beneficiary-edit.help-reference')}
                    />
                </Fieldset>
                <Fieldset title={__('company')}>
                    <CompanySelect
                        defaultCompany={savedData?.company ?? null}
                        onChange={handleChangeCompany}
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
                    <div class="BeneficiaryEditForm__locality">
                        <FormField
                            label="postal-code"
                            class="BeneficiaryEditForm__postal-code"
                            autocomplete="off"
                            v-model={data.postal_code}
                            errors={errors?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="BeneficiaryEditForm__city"
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
                        onChange={handleChange}
                    />
                </Fieldset>
                <Fieldset title={__('other-infos')}>
                    <FormField
                        label="notes"
                        type="textarea"
                        rows={4}
                        v-model={data.note}
                        errors={errors?.note}
                    />
                </Fieldset>
                {renderUserAccountSection()}
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

export default BeneficiaryEditForm;
