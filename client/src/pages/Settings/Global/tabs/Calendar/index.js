import './index.scss';
import { ref, computed, reactive } from '@vue/composition-api';
import axios from 'axios';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { confirm } from '@/utils/alert';
import apiSettings from '@/stores/api/settings';
import useI18n from '@/hooks/vue/useI18n';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

// @vue/component
const CalendarGlobalSettings = (props, { root }) => {
    const __ = useI18n();
    const isSaving = ref(false);
    const isSaved = ref(false);
    const error = ref(null);

    // - State "temporaire" juste pendant la durée de vie de ce formulaire.
    //   (on veut que le bouton de "Régénération du lien" du calendrier public
    //   ré-apparaisse lorsqu'on reviendra sur le formulaire)
    const hasRegeneratedCalendarLink = ref(false);

    const persistedData = computed(() => root.$store.state.settings.calendar);
    const values = reactive(pick(cloneDeep(persistedData.value), [
        'event.showLocation',
        'event.showBorrower',
        'public.enabled',
    ]));

    const help = computed(() => (
        isSaved.value
            ? { type: 'success', text: 'page.settings.calendar.saved' }
            : 'page.settings.calendar.help'
    ));

    const validationErrors = computed(() => {
        if (!error.value || !axios.isAxiosError(error.value)) {
            return null;
        }

        const { code, details } = error.value.response?.data?.error || { code: 0, details: {} };
        return code === 400 ? { ...details } : null;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        isSaving.value = true;
        error.value = null;
        try {
            await apiSettings.update({ calendar: values });
            root.$store.dispatch('settings/fetch');
            isSaved.value = true;
        } catch (err) {
            isSaved.value = false;
            if (err instanceof Error) {
                error.value = err;
            }
        } finally {
            isSaving.value = false;
        }
    };

    const handleRegenerateCalendarUrl = async () => {
        const { value: isConfirmed } = await confirm({
            title: __('warning'),
            text: __('page.settings.calendar.public-calendar-url-reset-warning'),
            confirmButtonText: __('yes-regenerate-link'),
            type: 'warning',
        });
        if (!isConfirmed) {
            return;
        }

        try {
            await apiSettings.reset('calendar.public.url');
            root.$store.dispatch('settings/fetch');
            hasRegeneratedCalendarLink.value = true;
        } catch {
            root.$toasted.error(__('page.settings.calendar.public-calendar-url-reset-error'));
        }
    };

    return () => {
        const renderPublicCalendarUrl = () => {
            const isClientSideEnabled = values.public.enabled;
            if (!isClientSideEnabled) {
                return null;
            }

            const isServerSideEnabled = persistedData.value.public.enabled;
            if (!isServerSideEnabled) {
                return (
                    <FormField
                        type="static"
                        label="page.settings.calendar.public-calendar-url"
                        value={__('page.settings.calendar.save-to-get-calendar-url')}
                    />
                );
            }

            return (
                <FormField
                    type="copy"
                    label="page.settings.calendar.public-calendar-url"
                    class="CalendarGlobalSettings__public-calendar-url"
                    value={persistedData.value.public.url}
                    scopedSlots={{
                        'help': () => {
                            if (hasRegeneratedCalendarLink.value) {
                                return (
                                    <span
                                        class={[
                                            'CalendarGlobalSettings__public-calendar-url__help',
                                            'CalendarGlobalSettings__public-calendar-url__help--success',
                                        ]}
                                    >
                                        {__('page.settings.calendar.public-calendar-url-reset-success')}
                                    </span>
                                );
                            }

                            return (
                                <span class="CalendarGlobalSettings__public-calendar-url__help">
                                    {__('page.settings.calendar.public-calendar-url-reset-help')}
                                    <Button onClick={handleRegenerateCalendarUrl} type="warning">
                                        {__('regenerate-link')}
                                    </Button>
                                </span>
                            );
                        },
                    }}
                />
            );
        };

        return (
            <div class="CalendarGlobalSettings">
                <Help message={help.value} error={error.value} isLoading={isSaving.value} />
                <form class="CalendarGlobalSettings__form" onSubmit={handleSubmit}>
                    <section class="CalendarGlobalSettings__section">
                        <h2>{__('page.settings.calendar.events-display-section-title')}</h2>
                        <FormField
                            type="switch"
                            label="page.settings.calendar.showLocation"
                            name="calendar.event.showLocation"
                            errors={validationErrors.value?.['calendar.event.showLocation']}
                            v-model={values.event.showLocation}
                        />
                        <FormField
                            type="switch"
                            label="page.settings.calendar.showBorrower"
                            name="calendar.event.showBorrower"
                            errors={validationErrors.value?.['calendar.event.showBorrower']}
                            v-model={values.event.showBorrower}
                        />
                    </section>
                    <section class="CalendarGlobalSettings__section">
                        <h2>{__('page.settings.calendar.public-calendar-section-title')}</h2>
                        <p class="CalendarGlobalSettings__help">{__('page.settings.calendar.public-calendar-help')}</p>
                        <FormField
                            type="switch"
                            label="page.settings.calendar.enable-public-calendar"
                            name="calendar.public.enabled"
                            errors={validationErrors.value?.['calendar.public.enabled']}
                            v-model={values.public.enabled}
                        />
                        {renderPublicCalendarUrl()}
                    </section>
                    <section class="CalendarGlobalSettings__actions">
                        <Button
                            icon="save"
                            htmlType="submit"
                            type="success"
                            disabled={isSaving.value}
                        >
                            {isSaving.value ? __('saving') : __('save')}
                        </Button>
                    </section>
                </form>
            </div>
        );
    };
};

export default CalendarGlobalSettings;
