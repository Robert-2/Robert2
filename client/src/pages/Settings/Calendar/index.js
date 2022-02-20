import './index.scss';
import { ref, computed, reactive } from '@vue/composition-api';
import axios from 'axios';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import apiSettings from '@/stores/api/settings';
import useI18n from '@/hooks/vue/useI18n';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

// @vue/component
const CalendarSettings = (props, { root }) => {
    const __ = useI18n();
    const isSaving = ref(false);
    const isSaved = ref(false);
    const error = ref(null);

    const persistedData = computed(() => root.$store.state.settings.calendar);
    const values = reactive(pick(cloneDeep(persistedData.value), [
        'event.showLocation',
        'event.showBorrower',
        'public.enabled',
    ]));

    const help = computed(() => (
        isSaved.value
            ? { type: 'success', text: 'page-settings.calendar.saved' }
            : 'page-settings.calendar.help'
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
            await apiSettings.put({ calendar: values });
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

    return () => {
        const renderPublicCalendarUrl = () => {
            const isServerSideEnabled = persistedData.value.public.enabled;
            const isClientSideEnabled = values.public.enabled;

            if (!isClientSideEnabled) {
                return null;
            }

            return (
                <FormField
                    type="static"
                    label="page-settings.calendar.public-calendar-url"
                    value={(
                        isServerSideEnabled
                            ? persistedData.value.public.url
                            : __('page-settings.calendar.save-to-get-calendar-url')
                    )}
                />
            );
        };

        return (
            <div class="CalendarSettings">
                <Help message={help.value} error={error.value} isLoading={isSaving.value} />
                <form class="CalendarSettings__form" onSubmit={handleSubmit}>
                    <section class="CalendarSettings__section">
                        <h2>{__('page-settings.calendar.events-display-section-title')}</h2>
                        <FormField
                            type="switch"
                            label="page-settings.calendar.showLocation"
                            name="calendar.event.showLocation"
                            errors={validationErrors.value?.['calendar.event.showLocation']}
                            vModel={values.event.showLocation}
                        />
                        <FormField
                            type="switch"
                            label="page-settings.calendar.showBorrower"
                            name="calendar.event.showBorrower"
                            errors={validationErrors.value?.['calendar.event.showBorrower']}
                            vModel={values.event.showBorrower}
                        />
                    </section>
                    <section class="CalendarSettings__section">
                        <h2>{__('page-settings.calendar.public-calendar-section-title')}</h2>
                        <p class="CalendarSettings__help">{__('page-settings.calendar.public-calendar-help')}</p>
                        <FormField
                            type="switch"
                            label="page-settings.calendar.enable-public-calendar"
                            name="calendar.public.enabled"
                            errors={validationErrors.value?.['calendar.public.enabled']}
                            vModel={values.public.enabled}
                        />
                        {renderPublicCalendarUrl()}
                    </section>
                    <section class="CalendarSettings__actions">
                        <Button
                            icon="save"
                            htmlType="submit"
                            class="success"
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

export default CalendarSettings;
