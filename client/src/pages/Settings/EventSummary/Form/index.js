import './index.scss';
import store from '@/store';
import FormField from '@/components/FormField/FormField.vue';

export default {
  name: 'EventSummarySettingsForm',
  components: { FormField },
  props: {
    settings: Object,
    isSaving: Boolean,
  },
  data() {
    const listModes = ['sub-categories', 'parks', 'flat'];
    const initialListModeOptions = listModes.map((mode) => (
      { value: mode, label: `page-settings.event-summary.list-display-mode-${mode}` }
    ));

    return {
      initialListModeOptions,
      defaultListMode: 'sub-categories',
    };
  },
  computed: {
    listModeOptions() {
      const parks = store.state.parks.list;

      return this.initialListModeOptions.filter((mode) => (
        mode.value !== 'parks' || parks.length > 1
      ));
    },
  },
  mounted() {
    store.dispatch('parks/fetch');
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      this.$emit('save', data);
    },
  },
  render() {
    const {
      $t: __,
      settings,
      listModeOptions,
      defaultListMode,
      handleSubmit,
      isSaving,
    } = this;

    return (
      <form class="EventSummarySettingsForm" onSubmit={handleSubmit}>
        <section class="EventSummarySettingsForm__section">
          <h3>{__('page-settings.event-summary.material-list')}</h3>
          <FormField
            type="select"
            label="page-settings.event-summary.display-mode"
            name="event_summary_material_display_mode"
            options={listModeOptions}
            value={settings?.event_summary_material_display_mode || defaultListMode}
          />
        </section>
        <section class="EventSummarySettingsForm__section">
          <h3>{__('page-settings.event-summary.custom-text')}</h3>
          <FormField
            type="text"
            label="page-settings.event-summary.custom-text-title"
            name="event_summary_custom_text_title"
            value={settings?.event_summary_custom_text_title || ''}
          />
          <FormField
            type="textarea"
            label="page-settings.event-summary.custom-text-content"
            name="event_summary_custom_text"
            value={settings?.event_summary_custom_text || ''}
          />
        </section>
        <section class="EventSummarySettingsForm__actions">
          <button type="submit" class="success" disabled={isSaving}>
            <i class="fas fa-save" />{' '}
            {isSaving ? __('saving') : __('save')}
          </button>
        </section>
      </form>
    );
  },
};
