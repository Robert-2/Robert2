import Help from '@/components/Help';
import EventSummarySettingsForm from './Form';

// @vue/component
export default {
    name: 'EventSummarySettings',
    data() {
        return {
            help: 'page-settings.event-summary.help',
            settings: null,
            isLoading: false,
            error: null,
            errors: null,
        };
    },
    mounted() {
        this.fetchSettings();
    },
    methods: {
        async fetchSettings() {
            this.isLoading = true;
            this.error = null;

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
            this.error = null;
            this.errors = null;

            try {
                const { data } = await this.$http.put('settings', newData);
                this.settings = data;
                this.help = { type: 'success', text: 'page-settings.event-summary.saved' };
            } catch (error) {
                this.error = error;

                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.errors = { ...details };
                }
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const { help, isLoading, error, settings, handleSave, errors } = this;

        return (
            <div class="EventSummarySettings">
                <Help message={help} error={error} isLoading={isLoading} />
                <EventSummarySettingsForm
                    settings={settings}
                    onSave={handleSave}
                    isSaving={isLoading}
                    errors={errors}
                />
            </div>
        );
    },
};
