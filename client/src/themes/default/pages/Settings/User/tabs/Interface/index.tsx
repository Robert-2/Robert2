import './index.scss';
import Vue from 'vue';
import axios from 'axios';
import { defineComponent } from '@vue/composition-api';
import apiUsers, { BookingsViewMode } from '@/stores/api/users';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';
import { ApiErrorCode } from '@/stores/api/@codes';

import type { UserSettings } from '@/stores/api/users';
import type { Options } from '@/utils/formatOptions';

type FormData = Pick<UserSettings, (
    | 'language'
    | 'default_bookings_view'
)>;

type Data = {
    hasCriticalError: boolean,
    isFetching: boolean,
    isSaving: boolean,
    data: FormData,
    validationErrors: Record<keyof FormData, string> | undefined,
};

const normalizeFormData = (savedData?: UserSettings): FormData => ({
    language: savedData?.language ?? '',
    default_bookings_view: savedData?.default_bookings_view ?? BookingsViewMode.CALENDAR,
});

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
        data: normalizeFormData(),
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
                this.data = normalizeFormData(await apiUsers.getSettings('self'));
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetching = false;
            }
        },

        async save() {
            const { $t: __ } = this;

            if (this.isSaving) {
                return;
            }
            this.isSaving = true;

            try {
                const updatedSettings = await apiUsers.updateSettings('self', this.data);
                this.data = normalizeFormData(updatedSettings);
                this.$toasted.success(__('page.user-settings.saved'));
                this.validationErrors = undefined;

                localStorage.setItem('userLocale', updatedSettings.language);
                this.$store.commit('auth/setLocale', updatedSettings.language);
                this.$store.commit('auth/setInterfaceSettings', updatedSettings);
                Vue.i18n.set(updatedSettings.language);
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
            data,
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
                        v-model={data.language}
                        error={validationErrors?.language}
                        label="page.user-settings.interface.language"
                        class="InterfaceUserSettings__language"
                        placeholder={false}
                    />
                    <FormField
                        type="select"
                        options={bookingsViewModesOptions}
                        v-model={data.default_bookings_view}
                        error={validationErrors?.default_bookings_view}
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
