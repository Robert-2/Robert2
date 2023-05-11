import './index.scss';
import { ref, computed, reactive, onMounted } from '@vue/composition-api';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import useI18n from '@/hooks/useI18n';
import apiSettings from '@/stores/api/settings';
import { ApiErrorCode } from '@/stores/api/@codes';
import Help from '@/themes/default/components/Help';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';

const LIST_MODES = Object.freeze(['categories', 'sub-categories', 'parks', 'flat']);

// @vue/component
const EventSummaryGlobalSettings = (props, { root }) => {
    const __ = useI18n();
    const isSaving = ref(false);
    const error = ref(null);
    const values = reactive(
        (() => {
            const _values = cloneDeep(root.$store.state.settings.eventSummary);
            if ([undefined, null].includes(_values.customText?.title)) {
                _values.customText.title = '';
            }
            if ([undefined, null].includes(_values.customText?.content)) {
                _values.customText.content = '';
            }
            return _values;
        })(),
    );

    const listModeOptions = computed(() => {
        const parks = root.$store.state.parks.list;

        return LIST_MODES
            .filter((mode) => mode !== 'parks' || parks.length > 1)
            .map((mode) => ({
                value: mode,
                label: __(`page.settings.event-summary.list-display-mode-${mode}`),
            }));
    });

    const validationErrors = computed(() => {
        if (!error.value || !axios.isAxiosError(error.value)) {
            return null;
        }

        const { code, details } = error.value.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
        return code === ApiErrorCode.VALIDATION_FAILED ? { ...details } : null;
    });

    onMounted(() => {
        root.$store.dispatch('parks/fetch');
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving.value) {
            return;
        }

        isSaving.value = true;
        error.value = null;
        try {
            await apiSettings.update({ eventSummary: values });
            root.$store.dispatch('settings/fetch');
            root.$toasted.success(__('page.settings.event-summary.saved'));
        } catch (err) {
            if (err instanceof Error) {
                error.value = err;
            }
        } finally {
            isSaving.value = false;
        }
    };

    return () => (
        <div class="EventSummaryGlobalSettings">
            <Help
                message={__('page.settings.event-summary.help')}
                error={error.value}
            />
            <form class="EventSummaryGlobalSettings__form" onSubmit={handleSubmit}>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page.settings.event-summary.header')}</h3>
                    <FormField
                        type="switch"
                        label="page.settings.event-summary.display-legal-numbers"
                        name="eventSummary.showLegalNumbers"
                        errors={validationErrors.value?.['eventSummary.showLegalNumbers']}
                        v-model={values.showLegalNumbers}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page.settings.event-summary.material-list')}</h3>
                    <FormField
                        type="select"
                        label="page.settings.event-summary.display-mode"
                        name="eventSummary.materialDisplayMode"
                        options={listModeOptions.value}
                        errors={validationErrors.value?.['eventSummary.materialDisplayMode']}
                        v-model={values.materialDisplayMode}
                        placeholder={false}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__section">
                    <h3>{__('page.settings.event-summary.custom-text')}</h3>
                    <FormField
                        type="text"
                        label="page.settings.event-summary.custom-text-title"
                        name="eventSummary.customText.title"
                        errors={validationErrors.value?.['eventSummary.customText.title']}
                        v-model={values.customText.title}
                    />
                    <FormField
                        type="textarea"
                        label="page.settings.event-summary.custom-text-content"
                        name="eventSummary.customText.content"
                        rows={10}
                        errors={validationErrors.value?.['eventSummary.customText.content']}
                        v-model={values.customText.content}
                    />
                </section>
                <section class="EventSummaryGlobalSettings__actions">
                    <Button
                        icon="save"
                        htmlType="submit"
                        type="success"
                        loading={isSaving.value}
                    >
                        {isSaving.value ? __('saving') : __('save')}
                    </Button>
                </section>
            </form>
        </div>
    );
};

export default EventSummaryGlobalSettings;
