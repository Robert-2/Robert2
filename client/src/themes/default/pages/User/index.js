import './index.scss';
import Page from '@/themes/default/components/Page';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Form from './components/Form';
import apiUsers from '@/stores/api/users';

// @vue/component
export default {
    name: 'User',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            isFetched: false,
            isSaving: false,
            user: null,
            criticalError: null,
            validationErrors: null,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
        },
        pageTitle() {
            const { $t: __, isNew, isFetched, user } = this;

            if (isNew) {
                return __('page.user.title-create');
            }

            return isFetched
                ? __('page.user.title-edit', { name: user.pseudo })
                : __('page.user.title-edit-simple');
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');

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
                this.user = null;
                this.isFetched = true;
                return;
            }

            try {
                this.user = await apiUsers.one(this.id);
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
                    ? apiUsers.update(this.id, data)
                    : apiUsers.create(data)
            );

            try {
                const user = await doRequest();
                if (!this.isNew) {
                    this.user = user;
                }

                this.validationErrors = null;

                // - Redirection...
                this.$toasted.success(__('page.user.saved'));
                this.$router.push({ name: 'users' });
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
            user,
            handleSubmit,
            handleCancel,
            criticalError,
            validationErrors,
        } = this;

        if (criticalError || !isFetched) {
            return (
                <Page name="user-edit" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="user-edit"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="UserEdit">
                    <Form
                        savedData={user}
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
