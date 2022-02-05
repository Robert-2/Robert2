import './index.scss';
import Help from '@/components/Help';
import FormField from '@/components/FormField';

// @vue/component
export default {
    name: 'UserProfile',
    components: { Help, FormField },
    data() {
        const { user } = this.$store.state.auth;

        return {
            help: 'page-profile.help',
            error: null,
            isLoading: false,
            isPasswordEdit: false,
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
    computed: {
        groupId() {
            const { user } = this.$store.state.auth;
            return user ? user.groupId : '';
        },
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

        handleTogglePasswordEdit(e) {
            e.preventDefault();

            this.isPasswordEdit = !this.isPasswordEdit;
            if (!this.isPasswordEdit) {
                this.user.password = '';
                this.user.password_confirmation = '';
            }
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetch() {
            const { id } = this.$store.state.auth.user;
            const { resource } = this.$route.meta;

            this.resetHelpLoading();
            try {
                const { data } = await this.$http.get(`${resource}/${id}`);
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
                    this.errors.password = [this.$t('page-profile.password-confirmation-must-match')];
                    this.displayError(this.$t('errors.validation'));
                    return;
                }
                this.errors.password = null;
                delete postData.password_confirmation;
                delete postData.person;
            }

            const { resource } = this.$route.meta;
            this.resetHelpLoading();
            try {
                const { data } = await this.$http.put(`${resource}/${id}`, postData);
                const text = this.isPasswordEdit ? 'page-profile.password-modified' : 'page-profile.saved';
                this.help = { type: 'success', text };
                this.isPasswordEdit = false;

                this.setUserData(data);
                this.$store.commit('auth/setUserProfile', data);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        resetHelpLoading() {
            this.help = 'page-profile.help';
            this.error = null;
            this.isLoading = true;
        },

        displayError(error) {
            this.help = 'page-profile.help';
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
            groupId,
            errors,
            handleSave,
            handleTogglePasswordEdit,
            isPasswordEdit,
        } = this;

        const className = ['content__main-view', 'UserProfile', {
            'UserProfile--password-edit': isPasswordEdit,
        }];

        return (
            <div class="content">
                <div class={className}>
                    <h3 class="UserProfile__title">
                        {__('page-profile.you-are-group', { group: __(groupId) })}
                    </h3>
                    <div class="UserProfile__content">
                        <form class="Form" method="POST" onSubmit={handleSave}>
                            <section class="Form__fieldset">
                                <h4 class="Form__fieldset__title">{__('connexion-infos')}</h4>
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
                            </section>
                            {!isPasswordEdit && (
                                <a
                                    role="button"
                                    class="UserProfile__password-edit-toggle"
                                    onClick={handleTogglePasswordEdit}
                                >
                                    {__('page-profile.edit-password')}
                                </a>
                            )}
                            <section class="Form__fieldset UserProfile__section-password">
                                <h4 class="Form__fieldset__title">
                                    <a
                                        role="button"
                                        class="UserProfile__password-edit-cancel"
                                        onClick={handleTogglePasswordEdit}
                                    >
                                        {__('cancel')}
                                    </a>
                                    {__('page-profile.edit-password')}
                                </h4>
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
                                    label="page-profile.password-confirmation"
                                    type="password"
                                />
                            </section>
                            <section class="Form__fieldset UserProfile__section-infos">
                                <h4 class="Form__fieldset__title">{__('personnal-infos')}</h4>
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
                                    class="UserProfile__postal-code"
                                    errors={errors.postal_code}
                                />
                                <FormField
                                    vModel={user.person.locality}
                                    name="locality"
                                    label="city"
                                    errors={errors.locality}
                                />
                            </section>
                            <section class="Form__actions">
                                <button class="Form__actions__save success" type="submit">
                                    {__('save')}
                                </button>
                            </section>
                        </form>
                        <div class="UserProfile__extras">
                            <Help message={help} error={error} isLoading={isLoading} />
                            <div class="UserProfile__extras__buttons">
                                <router-link to="/user-settings" custom>
                                    {({ navigate }) => (
                                        <button type="button" onClick={navigate} class="info">
                                            <i class="fas fa-cogs" />
                                            {__('your-settings')}
                                        </button>
                                    )}
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};
