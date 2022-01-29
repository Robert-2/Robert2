import './index.scss';

// @vue/component
export default {
    name: 'Login',
    data() {
        let type = 'default';
        let text = this.$t('page-login.welcome');

        const { hash } = this.$route;
        switch (hash) {
            case '#bye':
                type = 'success';
                text = this.$t('page-login.bye');
                break;
            case '#expired':
                type = 'error';
                text = this.$t('page-login.error.expired-session');
                break;
            case '#restricted':
                type = 'error';
                text = this.$t('page-login.error.not-allowed');
                break;
            default:
                break;
        }

        return {
            message: { type, text, isLoading: false },
            credentials: { identifier: '', password: '' },
        };
    },
    methods: {
        async login() {
            this.message = {
                type: 'default',
                text: this.$t('page-login.please-wait'),
                isLoading: true,
            };

            try {
                await this.$store.dispatch('auth/login', { ...this.credentials });
                this.$router.replace('/');
            } catch (error) {
                if (!error.response) {
                    this.errorMessage({ code: 0, message: 'network error' });
                    return;
                }

                const { status, data } = error.response;
                const code = status === 404 && !data.error ? 0 : 404;
                const message = data.error ? data.error.message : 'network error';
                this.errorMessage({ code, message });
            }
        },

        errorMessage(error) {
            let text = this.$t('errors.api-unreachable');
            if (error.code === 404) {
                text = this.$t('page-login.error.bad-infos');
            }
            this.message = { type: 'error', text, isLoading: false };
        },

        handleSubmit(e) {
            e.preventDefault();

            this.login();
        },
    },
    render() {
        const { $t: __, message, credentials, handleSubmit } = this;

        return (
            <div class="Login">
                <div class={['Login__message', `Login__message--${message.type}`]}>
                    {message.isLoading && <i class="fa fa-circle-o-notch fa-spin" />}
                    {message.text}
                </div>
                <div class="Login__body">
                    <form class="Login__form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            vModel={credentials.identifier}
                            autocomplete="username"
                            class="Login__form__input"
                            placeholder={__('email-address-or-pseudo')}
                        />
                        <input
                            type="password"
                            vModel={credentials.password}
                            autocomplete="current-password"
                            class="Login__form__input"
                            placeholder={__('password')}
                        />
                        <button type="submit" class="Login__form__submit info">
                            <i class="fa fa-user-alt" />
                            {__('page-login.connexion')}
                        </button>
                    </form>
                </div>
            </div>
        );
    },
};
