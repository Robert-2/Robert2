import './index.scss';
import HttpCode from 'status-code-enum';
import Button from '@/themes/default/components/Button';

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
                const { status = HttpCode.ServerErrorInternal } = error.response ?? {};

                let message;
                switch (status) {
                    // - Si les données transmises sont incomplètes ou les identifiants invalides.
                    case HttpCode.ClientErrorBadRequest:
                    case HttpCode.ClientErrorUnauthorized:
                        message = __('page.login.error.bad-infos');
                        break;

                    default:
                        message = __('errors.api-unreachable');
                }
                this.message = { type: 'error', text: message, isLoading: false };
            }
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
