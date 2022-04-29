import './index.scss';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Form from './Form';
import apiCompanies from '@/stores/api/companies';

// @vue/component
export default {
    name: 'Company',
    data() {
        const id = this.$route.params.id && this.$route.params.id !== 'new'
            ? this.$route.params.id
            : null;

        return {
            id,
            isFetched: id === null,
            isSaving: false,
            hasCriticalError: false,
            company: null,
            // persons: [],
            validationErrors: null,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },
        pageTitle() {
            const { $t: __, isNew, isFetched, company } = this;

            if (isNew) {
                return __('page-company.title-create');
            }

            return isFetched
                ? __('page-company.title-edit', { name: company.legal_name })
                : __('page-company.title-edit-simple');
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(data) {
            this.save(data);
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                this.isFetched = true;
                return;
            }

            try {
                this.company = await apiCompanies.one(this.id);
                this.isFetched = true;

                // TODO: À refactorer si ré-introduit.
                // const { data: personsData } = await this.$http.get(`companies/${this.id}/persons`);
                // this.persons = personsData.data;
            } catch {
                this.hasCriticalError = true;
            }
        },

        async save(data) {
            if (this.isSaving) {
                return;
            }

            const { $t: __ } = this;

            this.isSaving = true;

            const doRequest = () => {
                // FIXME: Pourquoi caster `country_id` et surtout, sans checker sa valeur avant ?
                const _data = { ...data, country_id: parseInt(data.country_id, 10) };
                return this.id
                    ? apiCompanies.update(this.id, _data)
                    : apiCompanies.create(_data);
            };

            try {
                this.company = await doRequest();
                this.id = this.company.id;

                this.validationErrors = null;

                // - Actualise la liste des sociétés dans le store global.
                this.$store.dispatch('companies/refresh');

                // - Redirection...
                this.$toasted.success(__('page-company.saved'));
                this.$router.back();
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = { ...details };
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            pageTitle,
            isSaving,
            isFetched,
            company,
            // persons,
            handleSubmit,
            hasCriticalError,
            validationErrors,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="company-edit" title={pageTitle}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="company-edit"
                title={pageTitle}
                help={__('page-company.help')}
                error={validationErrors ? __('errors.validation') : undefined}
            >
                <div class="CompanyEdit">
                    <Form
                        savedData={company}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                    />
                    {/*
                    {persons.length > 0 && (
                        <div class="CompanyEdit__persons">
                            <h4 class="CompanyEdit__persons__title">
                                {__('page-company.attached-persons')}
                            </h4>
                            <ul class="CompanyEdit__persons__list">
                                {persons.map(({ id, full_name: fullName }) => (
                                    <li key={id}>{fullName}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    */}
                </div>
            </Page>
        );
    },
};
