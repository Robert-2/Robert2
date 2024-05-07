import './index.scss';
import { defineComponent } from '@vue/composition-api';
import axios from 'axios';
import Vue from 'vue';
import apiUsers, { BookingsViewMode } from '@/stores/api/users';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';
import { ApiErrorCode } from '@/stores/api/@codes';

import type { UserSettings } from '@/stores/api/users';
import type { Options } from '@/utils/formatOptions';

type InterfaceSettings = Pick<UserSettings, (
    | 'language'
    | 'default_bookings_view'
)>;

type Data = {
    hasCriticalError: boolean,
    isFetching: boolean,
    isSaving: boolean,
    settings: InterfaceSettings,
    validationErrors: Record<keyof InterfaceSettings, string[]> | undefined,
};

/** Onglet "interface" des paramètres utilisateur. */
const InterfaceUserSettings = defineComponent({
    name: 'InterfaceUserSettings',
    provide: {
        verticalForm: true,
    },
    data: (): Data => ({
        hasCriticalError: false,
        isFetching: false,
        isSaving: false,
        settings: {
            language: '',
            default_bookings_view: BookingsViewMode.CALENDAR,
        },
        validationErrors: undefined,
    }),
    computed: {
        langsOptions: (): Options<{ id: 'fr' | 'en' }> => [
            { label: 'Français', value: 'fr' },
            { label: 'English', value: 'en' },
        ],

        bookingsViewModesOptions(): Options<{ id: BookingsViewMode }> {
            const { $t: __ } = this;

            return [
                {
                    label: __('page.user-settings.interface.booking-view-mode.calendar'),
                    value: BookingsViewMode.CALENDAR,
                },
                {
                    label: __('page.user-settings.interface.booking-view-mode.listing'),
                    value: BookingsViewMode.LISTING,
                },
            ];
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
            this.isFetching = true;

            try {
                this.settings = await apiUsers.getSettings('self');
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetching = false;
            }
        },

        async save() {
            const { $t: __ } = this;
            this.isSaving = true;

            try {
                this.settings = await apiUsers.updateSettings('self', this.settings);
                this.$toasted.success(__('page.user-settings.saved'));
                this.validationErrors = undefined;

                localStorage.setItem('userLocale', this.settings.language);
                this.$store.commit('auth/setLocale', this.settings.language);
                this.$store.commit('auth/setInterfaceSettings', this.settings);

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
            bookingsViewModesOptions,
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
                        errors={validationErrors?.language}
                        label="page.user-settings.interface.language"
                        class="InterfaceUserSettings__language"
                        placeholder={false}
                    />
                    <FormField
                        type="select"
                        options={bookingsViewModesOptions}
                        v-model={settings.default_bookings_view}
                        errors={validationErrors?.default_bookings_view}
                        label="page.user-settings.interface.default-bookings-view"
                        class="InterfaceUserSettings__default-bookings-view"
                        placeholder={false}
                    />
                </section>
                <section class="InterfaceUserSettings__actions">
                    <Button icon="save" htmlType="submit" type="primary" loading={isSaving}>
                        {__('save')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default InterfaceUserSettings;
