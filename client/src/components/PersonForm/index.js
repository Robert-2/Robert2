import './index.scss';
import FormField from '@/components/FormField';

// @vue/component
export default {
    name: 'PersonForm',
    props: {
        person: { type: Object, default: () => ({}) },
        errors: { type: Object, default: () => ({}) },
        withCompany: Boolean,
        withReference: Boolean,
    },
    computed: {
        countriesOptions() {
            return this.$store.getters['countries/options'];
        },

        companiesOptions() {
            return this.$store.getters['companies/options'];
        },
    },
    mounted() {
        this.$store.dispatch('countries/fetch');
        this.$store.dispatch('companies/fetch');
    },
    methods: {
        handleSubmit(e) {
            this.$emit('submit', e);
        },

        handleChange(e) {
            this.$emit('change', e);
        },

        handleBack() {
            this.$emit('cancel');
            this.$router.back();
        },
    },
    render() {
        const {
            $t: __,
            person,
            errors,
            countriesOptions, // TODO: Migrate.
            companiesOptions, // TODO: Migrate.
            withReference,
            withCompany,
            handleChange,
            handleSubmit,
            handleBack,
        } = this;

        return (
            <form
                class="Form Form--fixed-actions PersonForm"
                method="POST"
                onSubmit={handleSubmit}
                onChange={handleChange}
            >
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('personnal-infos')}</h4>
                    <FormField
                        name="first_name"
                        label="first-name"
                        vModel={person.first_name}
                        errors={errors.first_name}
                        required
                    />
                    <FormField
                        name="last_name"
                        label="last-name"
                        vModel={person.last_name}
                        errors={errors.last_name}
                        required
                    />
                    {withReference && (
                        <FormField
                            name="reference"
                            label="reference"
                            vModel={person.reference}
                            errors={errors.reference}
                        />
                    )}
                    {!withCompany && (
                        <FormField
                            name="nickname"
                            label="nickname"
                            vModel={person.nickname}
                            errors={errors.nickname}
                        />
                    )}
                </section>
                {withCompany && (
                    <section class="Form__fieldset">
                        <h4 class="Form__fieldset__title">{__('company')}</h4>
                        <div class="PersonForm__company">
                            <FormField
                                name="company_id"
                                label="company"
                                type="select"
                                options={companiesOptions}
                                vModel={person.company_id}
                                errors={errors.company_id}
                            />
                            {!!person.company_id && (
                                <router-link
                                    to={`/companies/${person.company_id}`}
                                    class="PersonForm__company__edit-btn button info"
                                >
                                    <i class="fas fa-edit" /> {__('page-companies.edit-btn')}
                                </router-link>
                            )}
                        </div>
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
                        vModel={person.phone}
                        errors={errors.phone}
                    />
                    <FormField
                        name="email"
                        label="email"
                        type="email"
                        vModel={person.email}
                        errors={errors.email}
                    />
                    <FormField
                        name="street"
                        label="street"
                        vModel={person.street}
                        errors={errors.street}
                    />
                    <FormField
                        name="postal_code"
                        label="postal-code"
                        class="PersonForm__postal-code"
                        vModel={person.postal_code}
                        errors={errors.postal_code}
                    />
                    <FormField
                        name="locality"
                        label="city"
                        vModel={person.locality}
                        errors={errors.locality}
                    />
                    <FormField
                        name="country_id"
                        label="country"
                        type="select"
                        options={countriesOptions}
                        vModel={person.country_id}
                        errors={errors.country_id}
                    />
                </section>
                <section class="Form__fieldset">
                    <h4 class="Form__fieldset__title">{__('other-infos')}</h4>
                    <FormField
                        label="notes"
                        name="note"
                        type="textarea"
                        class="PersonForm__notes"
                        vModel={person.note}
                        errors={errors.note}
                    />
                </section>
                <section class="Form__actions">
                    <button class="Form__actions__save success" type="submit">
                        <i class="fas fa-save" /> {__('save')}
                    </button>
                    <button type="button" onClick={handleBack}>
                        <i class="fas fa-ban" /> {__('cancel')}
                    </button>
                </section>
            </form>
        );
    },
};
