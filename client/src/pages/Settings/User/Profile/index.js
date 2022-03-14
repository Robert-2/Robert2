import './index.scss';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'ProfileUserSettings',
    data() {
        const { user } = this.$store.state.auth;

        return {
            help: 'page-user-settings.profile.help',
            error: null,
            isLoading: false,
            user: {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                password: '',
                password_confirmation: '',
                group_id: user.groupId,
                person: {
                    first_name: '',
                    last_name: '',
                    nickname: '',
                    phone: '',
                    street: '',
                    postal_code: '',
                    locality: '',
                },
            },
            errors: {
                pseudo: null,
                email: null,
                password: null,
                group_id: null,
                person: {
                    first_name: null,
                    last_name: null,
                    nickname: null,
                    phone: null,
                    street: null,
                    postal_code: null,
                    locality: null,
                },
            },
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
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetch() {
            const { id } = this.$store.state.auth.user;

            this.resetHelpLoading();
            try {
                const { data } = await this.$http.get(`users/${id}`);
                this.setUserData(data);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            const { id, password } = this.user;
            if (!id) {
                return;
            }

            const postData = { ...this.user };
            if (password) {
                if (password !== this.user.password_confirmation) {
                    this.errors.password = [this.$t('page-user-settings.profile.password-confirmation-must-match')];
                    this.displayError(this.$t('errors.validation'));
                    return;
                }
                this.errors.password = null;
                delete postData.password_confirmation;
            }

            this.resetHelpLoading();
            try {
                const { data } = await this.$http.put(`users/${id}`, postData);

                const text = password
                    ? 'page-user-settings.profile.saved-with-password'
                    : 'page-user-settings.profile.saved';

                this.help = { type: 'success', text };

                this.setUserData(data);
                this.$store.commit('auth/setUserProfile', data);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        resetHelpLoading() {
            this.help = 'page-user-settings.profile.help';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page-user-settings.profile.help';
            this.error = error;
            this.isLoading = false;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
                this.errors = { ...details };
            }
        },

        setUserData(data) {
            let { person } = data;
            if (!person) {
                person = {
                    first_name: '',
                    last_name: '',
                    nickname: '',
                    phone: '',
                    street: '',
                    postal_code: '',
                    locality: '',
                };
            }

            this.user = { ...data, person };
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
                    <section class="ProfileUserSettings__section">
                        <h3 class="ProfileUserSettings__section__title">{__('connexion-infos')}</h3>
                        <div class="ProfileUserSettings__section__body">
                            <FormField
                                vModel={user.pseudo}
                                name="pseudo"
                                label="pseudo"
                                required
                                errors={errors.pseudo}
                            />
                            <FormField
                                vModel={user.email}
                                name="email"
                                label="email"
                                type="email"
                                required
                                errors={errors.email}
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__section ProfileUserSettings__section--password">
                        <h3 class="ProfileUserSettings__section__title">
                            {__('page-user-settings.profile.new-password')}
                        </h3>
                        <p class="ProfileUserSettings__section__help">
                            {__('page-user-settings.profile.new-password-help')}
                        </p>
                        <div class="ProfileUserSettings__section__body">
                            <FormField
                                vModel={user.password}
                                name="password"
                                label="password"
                                type="password"
                                errors={errors.password}
                            />
                            <FormField
                                vModel={user.password_confirmation}
                                name="passwordConfirmation"
                                label="page-user-settings.profile.password-confirmation"
                                type="password"
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__section ProfileUserSettings__section--infos">
                        <h3 class="ProfileUserSettings__section__title">{__('personnal-infos')}</h3>
                        <div class="ProfileUserSettings__section__body">
                            <FormField
                                vModel={user.person.first_name}
                                name="first_name"
                                label="first-name"
                                errors={errors.first_name}
                            />
                            <FormField
                                vModel={user.person.last_name}
                                name="last_name"
                                label="last-name"
                                errors={errors.last_name}
                            />
                            <FormField
                                vModel={user.person.nickname}
                                name="nickname"
                                label="nickname"
                                errors={errors.nickname}
                            />
                            <FormField
                                vModel={user.person.phone}
                                name="phone"
                                label="phone"
                                type="tel"
                                errors={errors.phone}
                            />
                            <FormField
                                vModel={user.person.street}
                                name="street"
                                label="street"
                                errors={errors.street}
                            />
                            <FormField
                                vModel={user.person.postal_code}
                                name="postal_code"
                                label="postal-code"
                                class="ProfileUserSettings__postal-code"
                                errors={errors.postal_code}
                            />
                            <FormField
                                vModel={user.person.locality}
                                name="locality"
                                label="city"
                                errors={errors.locality}
                            />
                        </div>
                    </section>
                    <section class="ProfileUserSettings__actions">
                        <Button icon="save" htmlType="submit" type="success">
                            {__('save')}
                        </Button>
                    </section>
                </form>
            </div>
        );
    },
};
