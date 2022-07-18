import './index.scss';
import Page from '@/components/Page';
import CriticalError, { ERROR } from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Form from './components/Form';
import apiTechnicians from '@/stores/api/technicians';

// @vue/component
export default {
    name: 'Technician',
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
                return __('page.technician.title-create');
            }

            if (!isFetched) {
                return __('page.technician.title-edit-simple');
            }

            const { full_name: fullName, first_name: firstName, last_name: lastName } = person;
            const name = fullName || `${firstName} ${lastName}`;
            return __('page.technician.title-edit', { name });
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

        handleSave(data) {
            this.save(data);
        },

        handleCancel() {
            this.$router.back();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                this.isFetched = true;
                return;
            }

            try {
                this.person = await apiTechnicians.one(this.id);
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
                    ? apiTechnicians.update(this.id, data)
                    : apiTechnicians.create(data)
            );

            try {
                const person = await doRequest();
                if (!this.isNew) {
                    this.person = person;
                }

                this.validationErrors = null;

                // - Redirection...
                this.$toasted.success(__('page.technician.saved'));
                this.$router.replace({ name: 'view-technician', params: { id: person.id } });
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
            person,
            handleSave,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="technician-edit" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="technician-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="TechnicianEdit">
                    <Form
                        savedData={person}
                        isSaving={isSaving}
                        errors={validationErrors}
                        onSubmit={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </Page>
        );
    },
};
