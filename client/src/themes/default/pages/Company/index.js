import './index.scss';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';
import apiCompanies from '@/stores/api/companies';

// @vue/component
export default {
    name: 'Company',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            isFetched: id === null,
            isSaving: false,
            company: null,
            criticalError: null,
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
                return __('page.company.title-create');
            }

            return isFetched
                ? __('page.company.title-edit', { name: company.legal_name })
                : __('page.company.title-edit-simple');
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

        handleCancel() {
            this.$router.back();
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
            } catch (error) {
                const status = error?.response?.status ?? 500;
                this.criticalError = status === 404 ? ERROR.NOT_FOUND : ERROR.UNKNOWN;
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
                return !this.isNew
                    ? apiCompanies.update(this.id, _data)
                    : apiCompanies.create(_data);
            };

            try {
                const company = await doRequest();
                if (!this.isNew) {
                    this.company = company;
                }

                this.validationErrors = null;

                // - Redirection...
                this.$toasted.success(__('page.company.saved'));
                this.$router.back();
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = { ...details };
                    this.$refs.page.scrollToTop();
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            pageTitle,
            isSaving,
            isFetched,
            company,
            handleSubmit,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="company-edit" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="company-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="CompanyEdit">
                    <Form
                        savedData={company}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    },
};
