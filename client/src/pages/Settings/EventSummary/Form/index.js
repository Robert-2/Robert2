import './index.scss';
import getFormDataAsJson from '@/utils/getFormDataAsJson';
import FormField from '@/components/FormField';

const LIST_MODES = ['categories', 'sub-categories', 'parks', 'flat'];

// @vue/component
export default {
    name: 'EventSummarySettingsForm',
    props: {
        isSaving: Boolean,
        errors: { type: Object, default: null },
    },
    data() {
        const initialListModeOptions = LIST_MODES.map((mode) => (
            { value: mode, label: `page-settings.event-summary.list-display-mode-${mode}` }
        ));

        return {
            initialListModeOptions,
            defaultListMode: 'sub-categories',
        };
    },
    computed: {
        values() {
            const { $store: { state: { settings } } } = this;
            return settings.eventSummary;
        },
        listModeOptions() {
            const parks = this.$store.state.parks.list;

            return this.initialListModeOptions.filter((mode) => (
                mode.value !== 'parks' || parks.length > 1
            ));
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.$emit('save', getFormDataAsJson(e.target));
        },
    },
    render() {
        const {
            $t: __,
            values,
            listModeOptions,
            defaultListMode,
            handleSubmit,
            isSaving,
            errors,
        } = this;

        return (
            <form class="EventSummarySettingsForm" onSubmit={handleSubmit}>
                <section class="EventSummarySettingsForm__section">
                    <h3>{__('page-settings.event-summary.header')}</h3>
                    <FormField
                        type="switch"
                        label="page-settings.event-summary.display-legal-numbers"
                        name="eventSummary.showLegalNumbers"
                        v-model={values.showLegalNumbers}
                        errors={errors && errors['eventSummary.showLegalNumbers']}
                    />
                </section>
                <section class="EventSummarySettingsForm__section">
                    <h3>{__('page-settings.event-summary.material-list')}</h3>
                    <FormField
                        type="select"
                        label="page-settings.event-summary.display-mode"
                        name="eventSummary.materialDisplayMode"
                        options={listModeOptions}
                        value={values.materialDisplayMode || defaultListMode}
                        errors={errors && errors['eventSummary.materialDisplayMode']}
                    />
                </section>
                <section class="EventSummarySettingsForm__section">
                    <h3>{__('page-settings.event-summary.custom-text')}</h3>
                    <FormField
                        type="text"
                        label="page-settings.event-summary.custom-text-title"
                        name="eventSummary.customText.title"
                        value={values.customText.title || ''}
                        errors={errors && errors['eventSummary.customText.title']}
                    />
                    <FormField
                        type="textarea"
                        label="page-settings.event-summary.custom-text-content"
                        name="eventSummary.customText.content"
                        value={values.customText.content || ''}
                        errors={errors && errors['eventSummary.customText.content']}
                    />
                </section>
                <section class="EventSummarySettingsForm__actions">
                    <button type="submit" class="success" disabled={isSaving}>
                        <i class="fas fa-save" /> {isSaving ? __('saving') : __('save')}
                    </button>
                </section>
            </form>
        );
    },
};
