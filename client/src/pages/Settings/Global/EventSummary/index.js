import './index.scss';
import { ref, computed, reactive, onMounted } from '@vue/composition-api';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import useI18n from '@/hooks/vue/useI18n';
import apiSettings from '@/stores/api/settings';
import Help from '@/components/Help';
import FormField from '@/components/FormField';
import Button from '@/components/Button';

const LIST_MODES = Object.freeze(['categories', 'sub-categories', 'parks', 'flat']);

// @vue/component
const EventSummaryGlobalSettings = (props, { root }) => {
    const __ = useI18n();
    const isSaving = ref(false);
    const isSaved = ref(false);
    const error = ref(null);
    const values = reactive(
        (() => {
            const _values = cloneDeep(root.$store.state.settings.eventSummary);
            if (_values.customText?.title == null) {
                _values.customText.title = '';
            }
            if (_values.customText?.content == null) {
                _values.customText.content = '';
            }
            return _values;
        })(),
    );

    const help = computed(() => (
        isSaved.value
            ? { type: 'success', text: 'page-settings.event-summary.saved' }
            : 'page-settings.event-summary.help'
    ));

    const listModeOptions = computed(() => {
        const parks = root.$store.state.parks.list;

        return LIST_MODES
            .filter((mode) => mode !== 'parks' || parks.length > 1)
            .map((mode) => ({
                value: mode,
                label: `page-settings.event-summary.list-display-mode-${mode}`,
            }));
    });

    const validationErrors = computed(() => {
        if (!error.value || !axios.isAxiosError(error.value)) {
            return null;
        }

        const { code, details } = error.value.response?.data?.error || { code: 0, details: {} };
        return code === 400 ? { ...details } : null;
    });

    onMounted(() => {
        root.$store.dispatch('parks/fetch');
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        isSaving.value = true;
        error.value = null;
        try {
            await apiSettings.update({ eventSummary: values });
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
        <div class="EventSummaryGlobalSettings">
            <Help message={help.value} error={error.value} isLoading={isSaving.value} />
            <form class="EventSummaryGlobalSettings__form" onSubmit={handleSubmit}>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page-settings.event-summary.header')}</h3>
                    <FormField
                        type="switch"
                        label="page-settings.event-summary.display-legal-numbers"
                        name="eventSummary.showLegalNumbers"
                        errors={validationErrors.value?.['eventSummary.showLegalNumbers']}
                        vModel={values.showLegalNumbers}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page-settings.event-summary.material-list')}</h3>
                    <FormField
                        type="select"
                        label="page-settings.event-summary.display-mode"
                        name="eventSummary.materialDisplayMode"
                        options={listModeOptions.value}
                        errors={validationErrors.value?.['eventSummary.materialDisplayMode']}
                        vModel={values.materialDisplayMode}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page-settings.event-summary.custom-text')}</h3>
                    <FormField
                        type="text"
                        label="page-settings.event-summary.custom-text-title"
                        name="eventSummary.customText.title"
                        errors={validationErrors.value?.['eventSummary.customText.title']}
                        vModel={values.customText.title}
                    />
                    <FormField
                        type="textarea"
                        label="page-settings.event-summary.custom-text-content"
                        name="eventSummary.customText.content"
                        errors={validationErrors.value?.['eventSummary.customText.content']}
                        vModel={values.customText.content}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__actions">
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

export default EventSummaryGlobalSettings;
