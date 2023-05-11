import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import Vue from 'vue';
import apiUsers from '@/stores/api/users';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';
import { ApiErrorCode } from '@/stores/api/@codes';

type Data = {
    hasCriticalError: boolean,
    isFetching: boolean,
    isSaving: boolean,
    langsOptions: Array<{ label: string, value: string }>,
    settings: {
        language: string,
    },
    validationErrors: {
        language: string[] | null,
    },
};

// @vue/component
const InterfaceUserSettings = defineComponent({
    name: 'InterfaceUserSettings',
    provide: {
        verticalForm: true,
    },
    data(): Data {
        return {
            hasCriticalError: false,
            isFetching: false,
            isSaving: false,
            langsOptions: [
                { label: 'Français', value: 'fr' },
                { label: 'English', value: 'en' },
            ],
            settings: {
                language: '',
            },
            validationErrors: {
                language: null,
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

        handleSave(e: SubmitEvent) {
            e.preventDefault();

            this.save();
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetch() {
            const { id } = this.$store.state.auth.user;
            this.isFetching = true;

            try {
                this.settings = await apiUsers.getSettings(id);
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetching = false;
            }
        },

        async save() {
            const { $t: __ } = this;
            const { id } = this.$store.state.auth.user;
            this.isSaving = true;

            try {
                this.settings = await apiUsers.saveSettings(id, this.settings);
                this.$toasted.success(__('page.user-settings.saved'));

                localStorage.setItem('userLocale', this.settings.language);
                this.$store.commit('auth/setLocale', this.settings.language);

                // @ts-expect-error En attendant un typage correct de ce module.
                Vue.i18n.set(this.settings.language);
            } catch (error) {
                if (!axios.isAxiosError(error)) {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                } else {
                    const { code = ApiErrorCode.UNKNOWN, details = {} } = error.response?.data?.error ?? {};
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                    } else {
                        this.$toasted.error(__('errors.unexpected-while-saving'));
                    }
                }
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            hasCriticalError,
            isFetching,
            settings,
            langsOptions,
            validationErrors,
            isSaving,
            handleSave,
        } = this;

        if (hasCriticalError || isFetching) {
            return (
                <div class="InterfaceUserSettings">
                    {hasCriticalError ? <CriticalError /> : <Loading class="InterfaceUserSettings__loading" />}
                </div>
            );
        }

        return (
            <form class="InterfaceUserSettings" onSubmit={handleSave}>
                <section class="InterfaceUserSettings__inputs">
                    <FormField
                        type="select"
                        options={langsOptions}
                        v-model={settings.language}
                        errors={validationErrors.language}
                        name="language"
                        label="page.user-settings.interface.language"
                        class="InterfaceUserSettings__language"
                        placeholder={false}
                    />
                </section>
                <section class="InterfaceUserSettings__actions">
                    <Button icon="save" htmlType="submit" type="success" loading={isSaving}>
                        {__('save')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default InterfaceUserSettings;
