import './index.scss';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Form from './Form';
import apiBeneficiaries from '@/stores/api/beneficiaries';

const WIP_STORAGE_KEY = 'WIP-newBeneficiary';

// @vue/component
export default {
    name: 'Beneficiary',
    data() {
        const id = this.$route.params.id && this.$route.params.id !== 'new'
            ? this.$route.params.id
            : null;

        return {
            id,
            isFetched: false,
            isSaving: false,
            hasCriticalError: false,
            person: null,
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
                return __('page-beneficiary.title-create');
            }

            if (!isFetched) {
                return __('page-beneficiary.title-edit-simple');
            }

            const { full_name: fullName, first_name: firstName, last_name: lastName } = person;
            const name = fullName || `${firstName} ${lastName}`;
            return __('page-beneficiary.title-edit', { name });
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

            const doRequest = () => (
                this.id
                    ? apiBeneficiaries.update(this.id, data)
                    : apiBeneficiaries.create(data)
            );

            try {
                this.person = await doRequest();
                this.id = this.person.id;

                this.validationErrors = null;
                this.flushStashedData();

                // - Redirection...
                this.$toasted.success(__('page-beneficiary.saved'));
                this.$router.replace({ name: 'beneficiaries' });
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

        flushStashedData() {
            localStorage.removeItem(WIP_STORAGE_KEY);
        },
    },
    render() {
        const {
            $t: __,
            pageTitle,
            isSaving,
            isFetched,
            person,
            handleSubmit,
            handleChange,
            handleCancel,
            hasCriticalError,
            validationErrors,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="beneficiary-edit" title={pageTitle}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="beneficiary-edit"
                title={pageTitle}
                help={__('page-beneficiary.help')}
                error={validationErrors ? __('errors.validation') : undefined}
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
