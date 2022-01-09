import './index.scss';
import { ref, computed, reactive } from '@vue/composition-api';
import axios from 'axios';
import useI18n from '@/hooks/useI18n';
import cloneDeep from 'lodash.clonedeep';
import apiSettings from '@/stores/api/settings';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

import type { AxiosError } from 'axios';
import type { Settings } from '@/stores/api/settings';
import type { Component, SetupContext } from '@vue/composition-api';

// @vue/component
const CalendarSettings: Component = (props: Record<string, never>, { root }: SetupContext) => {
    const __ = useI18n();
    const isSaving = ref(false);
    const isSaved = ref(false);
    const error = ref<AxiosError | Error | null>(null);
    const values = reactive<Settings['calendar']>(cloneDeep(root.$store.state.settings.calendar));

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

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
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

    return () => (
        <div class="CalendarSettings">
            <Help message={help.value} error={error.value} isLoading={isSaving.value} />
            <form class="CalendarSettings__form" onSubmit={handleSubmit}>
                <section class="CalendarSettings__section">
                    <h3>{__('page-settings.calendar.events-display-section-title')}</h3>
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

export default CalendarSettings;
