import './index.scss';
import FormField from '@/components/FormField';

// @vue/component
export default {
    name: 'CompanyForm',
    props: {
        company: Object,
        errors: Object,
    },
    computed: {
        countriesOptions() {
            return this.$store.getters['countries/options'];
        },
    },
    mounted() {
        this.$store.dispatch('countries/fetch');
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.$emit('submit', e);
        },

        handleBackClick() {
            this.$router.back();
        },
    },
    render() {
        const {
            $t: __,
            company,
            errors,
            countriesOptions,
            handleSubmit,
            handleBackClick,
        } = this;

        return (
            <form class="Form CompanyForm" onSubmit={handleSubmit}>
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('informations')}</h4>
                    <FormField
                        v-model={company.legal_name}
                        name="legal_name"
                        label="legal-name"
                        required
                        errors={errors.legal_name}
                    />
                    <FormField
                        v-model={company.phone}
                        name="phone"
                        label="phone"
                        class="CompanyForm__phone"
                        type="tel"
                        errors={errors.phone}
                    />
                </section>
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('address')}</h4>
                    <FormField
                        v-model={company.street}
                        name="street"
                        label="street"
                        errors={errors.street}
                    />
                    <FormField
                        v-model={company.postal_code}
                        name="postal_code"
                        label="postal-code"
                        class="CompanyForm__postal-code"
                        errors={errors.postal_code}
                    />
                    <FormField
                        v-model={company.locality}
                        name="locality"
                        label="city"
                        errors={errors.locality}
                    />
                    <FormField
                        v-model={company.country_id}
                        name="country_id"
                        label="country"
                        type="select"
                        options={countriesOptions}
                        errors={errors.country_id}
                    />
                </section>
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('other-infos')}</h4>
                    <FormField
                        v-model={company.note}
                        label="notes"
                        name="note"
                        type="textarea"
                        class="CompanyForm__notes"
                        errors={errors.note}
                    />
                </section>
                <section class="Form__actions">
                    <button class="Form__actions__save success" type="submit">
                        <i class="fas fa-save" /> {__('save')}
                    </button>
                    <button type="button" onClick={handleBackClick}>
                        <i class="fas fa-ban" /> {__('cancel')}
                    </button>
                </section>
            </form>
        );
    },
};
