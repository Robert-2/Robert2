import './index.scss';
import Page from '@/components/Page';
import CriticalError, { ERROR } from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Form from './components/Form';
import apiBeneficiaries from '@/stores/api/beneficiaries';

const WIP_STORAGE_KEY = 'WIP-newBeneficiary';

// @vue/component
export default {
    name: 'Beneficiary',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            isFetched: false,
            isSaving: false,
            person: null,
            criticalError: null,
            validationErrors: null,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },
        pageTitle() {
            const { $t: __, isNew, isFetched, person } = this;

            if (isNew) {
                return __('page.beneficiary.title-create');
            }

            if (!isFetched) {
                return __('page.beneficiary.title-edit-simple');
            }

            const { full_name: fullName, first_name: firstName, last_name: lastName } = person;
            const name = fullName || `${firstName} ${lastName}`;
            return __('page.beneficiary.title-edit', { name });
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

        handleChange(data) {
            if (!this.isNew) {
                return;
            }

            const stashedData = JSON.stringify(data);
            localStorage.setItem(WIP_STORAGE_KEY, stashedData);
        },

        handleSubmit(data) {
            this.save(data);
        },

        handleCancel() {
            this.flushStashedData();
            this.$router.back();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                const stashedData = localStorage.getItem(WIP_STORAGE_KEY);
                if (stashedData) {
                    try {
                        // TODO: Ne devrait pas être mis là mais dans le data de <Form>...
                        //       (overwrite de `DEFAULT_VALUES`)
                        this.person = JSON.parse(stashedData);
                    } catch {
                        // - On ne fait rien en cas d'erreur de parsing des données en cache.
                    }
                }
                this.isFetched = true;
                return;
            }

            try {
                this.person = await apiBeneficiaries.one(this.id);
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

            const doRequest = () => (
                !this.isNew
                    ? apiBeneficiaries.update(this.id, data)
                    : apiBeneficiaries.create(data)
            );

            try {
                const person = await doRequest();
                if (!this.isNew) {
                    this.person = person;
                }

                this.validationErrors = null;
                this.flushStashedData();

                // - Redirection...
                this.$toasted.success(__('page.beneficiary.saved'));
                this.$router.replace({ name: 'beneficiaries' });
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

        flushStashedData() {
            localStorage.removeItem(WIP_STORAGE_KEY);
        },
    },
    render() {
        const {
            pageTitle,
            isSaving,
            isFetched,
            person,
            handleSubmit,
            handleChange,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="beneficiary-edit" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="beneficiary-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="BeneficiaryEdit">
                    <Form
                        savedData={person}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSubmit}
                        onChange={handleChange}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    },
};
