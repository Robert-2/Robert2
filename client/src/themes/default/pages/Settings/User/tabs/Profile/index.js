import './index.scss';
import Help from '@/themes/default/components/Help';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';
import apiUsers from '@/stores/api/users';
import { ApiErrorCode } from '@/stores/api/@codes';

// @vue/component
export default {
    name: 'ProfileUserSettings',
    provide: {
        verticalForm: true,
    },
    data() {
        const { user } = this.$store.state.auth;

        return {
            help: 'page.user-settings.profile.help',
            error: null,
            isLoading: false,
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                pseudo: user.pseudo,
                email: user.email,
                phone: user.phone,
                password: '',
                password_confirmation: '',
            },
            errors: null,
        };
    },
    mounted() {
        this.fetch();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSave(e) {
            e.preventDefault();

            this.save();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch() {
            this.resetHelpLoading();
            try {
                this.user = await apiUsers.one('self');
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            const { $t: __, user } = this;

            const postData = { ...user };
            delete postData.group;

            const hasPassword = !!postData.password;
            if (hasPassword) {
                this.errors ??= { password: null };
                if (postData.password !== postData.password_confirmation) {
                    this.errors.password = [__('page.user-settings.profile.password-confirmation-must-match')];
                    this.displayError(__('errors.validation'));
                    return;
                }
                this.errors.password = null;
                delete postData.password_confirmation;
            }

            this.resetHelpLoading();
            try {
                this.user = await apiUsers.update('self', postData);
                this.$store.commit('auth/updateUser', this.user);

                const text = hasPassword
                    ? 'page.user-settings.profile.saved-with-password'
                    : 'page.user-settings.profile.saved';
                this.help = { type: 'success', text };
                this.errors = null;
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        resetHelpLoading() {
            this.help = 'page.user-settings.profile.help';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page.user-settings.profile.help';
            this.error = error;
            this.isLoading = false;

            const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
            if (code === ApiErrorCode.VALIDATION_FAILED) {
                this.errors = { ...details };
            }
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            isLoading,
            user,
            errors,
            handleSave,
        } = this;

        return (
            <div class="ProfileUserSettings">
                <Help message={help} error={error} isLoading={isLoading} />
                <form class="ProfileUserSettings__form" method="POST" onSubmit={handleSave}>
                    <section class="ProfileUserSettings__section ProfileUserSettings__section--infos">
                        <h3 class="ProfileUserSettings__section__title">{__('personal-infos')}</h3>
                        <div class="ProfileUserSettings__section__body">
                            <div class="ProfileUserSettings__name">
                                <FormField
                                    class="ProfileUserSettings__first-name"
                                    v-model={user.first_name}
                                    name="first_name"
                                    label="first-name"
                                    errors={errors?.first_name}
                                    required
                                />
                                <FormField
                                    class="ProfileUserSettings__last-name"
                                    v-model={user.last_name}
                                    name="last_name"
                                    label="last-name"
                                    errors={errors?.last_name}
                                    required
                                />
                            </div>
                            <FormField
                                v-model={user.phone}
                                name="phone"
                                label="phone"
                                type="tel"
                                errors={errors?.phone}
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__section">
                        <h3 class="ProfileUserSettings__section__title">{__('connexion-infos')}</h3>
                        <div class="ProfileUserSettings__section__body">
                            <FormField
                                v-model={user.pseudo}
                                name="pseudo"
                                label="pseudo"
                                errors={errors?.pseudo}
                                required
                            />
                            <FormField
                                v-model={user.email}
                                name="email"
                                label="email"
                                type="email"
                                errors={errors?.email}
                                required
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__section ProfileUserSettings__section--password">
                        <h3 class="ProfileUserSettings__section__title">
                            {__('page.user-settings.profile.new-password')}
                        </h3>
                        <p class="ProfileUserSettings__section__help">
                            {__('page.user-settings.profile.new-password-help')}
                        </p>
                        <div class="ProfileUserSettings__section__body">
                            <FormField
                                v-model={user.password}
                                name="password"
                                label="password"
                                type="password"
                                errors={errors?.password}
                            />
                            <FormField
                                v-model={user.password_confirmation}
                                name="passwordConfirmation"
                                label="page.user-settings.profile.password-confirmation"
                                type="password"
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__actions">
                        <Button icon="save" htmlType="submit" type="primary">
                            {__('save')}
                        </Button>
                    </section>
                </form>
            </div>
        );
    },
};
