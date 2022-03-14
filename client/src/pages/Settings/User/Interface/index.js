import './index.scss';
import Vue from 'vue';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

// @vue/component
export default {
    name: 'InterfaceUserSettings',
    data() {
        return {
            help: 'page-user-settings.interface.help',
            error: null,
            isLoading: true,
            langsOptions: [
                { label: 'french', value: 'FR' },
                { label: 'english', value: 'EN' },
            ],
            settings: {
                language: '',
                auth_token_validity_duration: '',
            },
            errors: {
                language: null,
                auth_token_validity_duration: null,
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
            this.isLoading = true;

            try {
                const { data } = await this.$http.get(`users/${id}/settings`);
                this.settings = data;
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async save() {
            const { id } = this.$store.state.auth.user;
            this.isLoading = true;

            try {
                const { data } = await this.$http.put(`users/${id}/settings`, this.settings);
                this.settings = data;
                this.help = { type: 'success', text: 'page-user-settings.interface.saved' };

                const userLocale = data.language.toLowerCase();
                localStorage.setItem('userLocale', userLocale);
                this.$store.commit('auth/setLocale', data.language);
                Vue.i18n.set(userLocale);
            } catch (error) {
                this.displayError(error);
            } finally {
                this.isLoading = false;
            }
        },

        displayError(error) {
            this.help = 'page-user-settings.interface.help';
            this.error = error;

            const { code, details } = error.response?.data?.error || { code: 0, details: {} };
            if (code === 400) {
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
            handleSave,
            settings,
            errors,
            langsOptions,
        } = this;

        return (
            <div class="InterfaceUserSettings">
                <Help message={help} error={error} isLoading={isLoading} />
                <form class="InterfaceUserSettings__form" method="POST" onSubmit={handleSave}>
                    <section class="InterfaceUserSettings__inputs">
                        <FormField
                            type="select"
                            options={langsOptions}
                            vModel={settings.language}
                            errors={errors.language}
                            name="language"
                            label="page-user-settings.interface.language"
                        />
                        <FormField
                            type="number"
                            vModel={settings.auth_token_validity_duration}
                            errors={errors.auth_token_validity_duration}
                            name="auth_token_validity_duration"
                            label="page-user-settings.interface.auth-token-validity-duration"
                            class="InterfaceUserSettings__hours"
                            addon={__('hours')}
                        />
                    </section>
                    <section class="InterfaceUserSettings__actions">
                        <Button icon="save" htmlType="submit" type="success">
                            {__('save')}
                        </Button>
                    </section>
                </form>
            </div>
        );
    },
};
