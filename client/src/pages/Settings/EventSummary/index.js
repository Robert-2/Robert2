import Help from '@/components/Help/Help.vue';
import EventSummarySettingsForm from './Form';

export default {
  name: 'EventSummarySettings',
  components: { Help, EventSummarySettingsForm },
  data() {
    return {
      help: 'page-settings.event-summary.help',
      settings: null,
      isLoading: false,
      error: null,
    };
  },
  mounted() {
    this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      this.isLoading = true;

      try {
        const { data } = await this.$http.get('settings');
        this.settings = data;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    async handleSave(newData) {
      this.isLoading = true;

      try {
        const { data } = await this.$http.put('settings', newData);
        this.settings = data;
        this.help = { type: 'success', text: 'page-settings.event-summary.saved' };
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  },
  render() {
    const {
      help,
      isLoading,
      error,
      settings,
      handleSave,
    } = this;

    return (
      <div class="EventSummarySettings">
        <Help
          message={help}
          error={error}
          isLoading={isLoading}
        />
        <EventSummarySettingsForm
          settings={settings}
          onSave={handleSave}
          isSaving={isLoading}
        />
      </div>
    );
  },
};
