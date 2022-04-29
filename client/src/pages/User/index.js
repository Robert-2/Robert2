import './index.scss';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Form from './Form';
import apiUsers from '@/stores/api/users';

const WIP_STORAGE_KEY = 'WIP-newUser';

// @vue/component
export default {
    name: 'User',
    data() {
        const id = this.$route.params.id && this.$route.params.id !== 'new'
            ? this.$route.params.id
            : null;

        return {
            id,
            isFetched: false,
            isSaving: false,
            hasCriticalError: false,
            user: null,
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
                return __('page-user.title-create');
            }

            return isFetched
                ? __('page-user.title-edit', { name: user.pseudo })
                : __('page-user.title-edit-simple');
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

        handleChange(data) {
            if (!this.isNew) {
                return;
            }

            const stashedData = JSON.stringify(data);
            localStorage.setItem(WIP_STORAGE_KEY, stashedData);
        },

        handleCancel() {
            this.flushStashedData();
            this.$router.back();
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            if (this.isNew) {
                const stashedData = localStorage.getItem(WIP_STORAGE_KEY);
                if (stashedData) {
                    try {
                        this.user = JSON.parse(stashedData);
                    } catch {
                        // - On ne fait rien en cas d'erreur de parsing des données en cache.
                    }
                }
                this.isFetched = true;
                return;
            }

            try {
                this.user = await apiUsers.one(this.id);
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
                    ? apiUsers.update(this.id, data)
                    : apiUsers.create(data)
            );

            try {
                this.user = await doRequest();
                this.id = this.user.id;

                this.validationErrors = null;
                this.flushStashedData();

                // - Redirection...
                this.$toasted.success(__('page-user.saved'));
                this.$router.push({ name: 'users' });
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
            user,
            handleSubmit,
            handleChange,
            handleCancel,
            hasCriticalError,
            validationErrors,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="user-edit" title={pageTitle}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="user-edit"
                title={pageTitle}
                help={__('page-user.help')}
                error={validationErrors ? __('errors.validation') : undefined}
            >
                <div class="UserEdit">
                    <Form
                        savedData={user}
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
