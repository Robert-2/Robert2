import './index.scss';
import Help from '@/components/Help';
import { defineComponent } from '@vue/composition-api';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import FormField from '@/components/FormField';

const LIST_MODES = ['categories', 'sub-categories', 'parks', 'flat'];

// @vue/component
export default defineComponent({
    name: 'EventSummarySettings',
    data() {
        return {
            isSaving: false,
            isSaved: false,
            error: null,
        };
    },
    computed: {
        help() {
            return this.isSaved
                ? { type: 'success', text: 'page-settings.event-summary.saved' }
                : 'page-settings.event-summary.help';
        },
        values() {
            const { $store: { state: { settings } } } = this;
            return settings.eventSummary;
        },
        listModeOptions() {
            const parks = this.$store.state.parks.list;

            return LIST_MODES
                .filter((mode) => mode !== 'parks' || parks.length > 1)
                .map((mode) => ({
                    value: mode,
                    label: `page-settings.event-summary.list-display-mode-${mode}`,
                }));
        },
        validationErrors() {
            if (!this.error) {
                return null;
            }

            const { code, details } = this.error.response?.data?.error || { code: 0, details: {} };
            return code === 400 ? { ...details } : null;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        async handleSubmit(e) {
            e.preventDefault();

            this.isSaving = true;
            this.error = null;

            try {
                await this.$http.put('settings', getFormDataAsJson(e.target));
                this.$store.dispatch('settings/fetch');

                this.isSaved = true;
            } catch (err) {
                this.isSaved = false;
                if (err instanceof Error) {
                    this.error = err;
                }
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            help,
            error,
            values,
            isSaving,
            handleSubmit,
            listModeOptions,
            validationErrors,
        } = this;

        return (
            <div class="EventSummarySettings">
                <Help message={help} error={error} isLoading={isSaving} />
                <form class="EventSummarySettings__form" onSubmit={handleSubmit}>
                    <section class="EventSummarySettings__section">
                        <h3>{__('page-settings.event-summary.header')}</h3>
                        <FormField
                            type="switch"
                            label="page-settings.event-summary.display-legal-numbers"
                            name="eventSummary.showLegalNumbers"
                            v-model={values.showLegalNumbers}
                            errors={validationErrors?.['eventSummary.showLegalNumbers']}
                        />
                    </section>
                    <section class="EventSummarySettings__section">
                        <h3>{__('page-settings.event-summary.material-list')}</h3>
                        <FormField
                            type="select"
                            label="page-settings.event-summary.display-mode"
                            name="eventSummary.materialDisplayMode"
                            options={listModeOptions}
                            value={values.materialDisplayMode || 'sub-categories'}
                            errors={validationErrors?.['eventSummary.materialDisplayMode']}
                        />
                    </section>
                    <section class="EventSummarySettings__section">
                        <h3>{__('page-settings.event-summary.custom-text')}</h3>
                        <FormField
                            type="text"
                            label="page-settings.event-summary.custom-text-title"
                            name="eventSummary.customText.title"
                            value={values.customText.title || ''}
                            errors={validationErrors?.['eventSummary.customText.title']}
                        />
                        <FormField
                            type="textarea"
                            label="page-settings.event-summary.custom-text-content"
                            name="eventSummary.customText.content"
                            value={values.customText.content || ''}
                            errors={validationErrors?.['eventSummary.customText.content']}
                        />
                    </section>
                    <section class="EventSummarySettings__actions">
                        <button type="submit" class="success" disabled={isSaving}>
                            <i class="fas fa-save" /> {isSaving ? __('saving') : __('save')}
                        </button>
                    </section>
                </form>
            </div>
        );
    },
});
