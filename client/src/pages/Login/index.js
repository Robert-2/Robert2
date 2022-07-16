import './index.scss';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'Login',
    data() {
        const { $t: __ } = this;

        let type = 'default';
        let text = __('page.login.welcome');

        const { hash } = this.$route;
        switch (hash) {
            case '#bye':
                type = 'success';
                text = __('page.login.bye');
                break;
            case '#expired':
                type = 'error';
                text = __('page.login.error.expired-session');
                break;
            case '#restricted':
                type = 'error';
                text = __('page.login.error.not-allowed');
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
            const { $t: __ } = this;

            this.message = {
                type: 'default',
                text: __('page.login.please-wait'),
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
            const { $t: __ } = this;

            const text = error.code === 404
                ? __('page.login.error.bad-infos')
                : __('errors.api-unreachable');

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
                        {/* => Input */}
                        <input
                            type="text"
                            v-model={credentials.identifier}
                            autocomplete="username"
                            class="Login__form__input"
                            placeholder={__('email-address-or-pseudo')}
                        />
                        <input
                            type="password"
                            v-model={credentials.password}
                            autocomplete="current-password"
                            class="Login__form__input"
                            placeholder={__('password')}
                        />
                        <Button
                            htmlType="submit"
                            type="primary"
                            class="Login__form__submit"
                        >
                            {__('page.login.connexion')}
                        </Button>
                    </form>
                </div>
            </div>
        );
    },
};
