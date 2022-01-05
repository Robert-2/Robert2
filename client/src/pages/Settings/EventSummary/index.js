import Help from '@/components/Help';
import EventSummarySettingsForm from './Form';
import { defineComponent } from '@vue/composition-api';

// @vue/component
export default defineComponent({
    name: 'EventSummarySettings',
    data() {
        return {
            help: 'page-settings.event-summary.help',
            isSaving: false,
            error: null,
            errors: null,
        };
    },
    methods: {
        async handleSave(newData) {
            this.isSaving = true;
            this.error = null;
            this.errors = null;

            try {
                await this.$http.put('settings', newData);
                this.help = { type: 'success', text: 'page-settings.event-summary.saved' };
                this.$store.dispatch('settings/fetch');
            } catch (error) {
                this.error = error;

                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.errors = { ...details };
                }
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const { help, isSaving, error, handleSave, errors } = this;

        return (
            <div class="EventSummarySettings">
                <Help message={help} error={error} isLoading={isSaving} />
                <EventSummarySettingsForm
                    onSave={handleSave}
                    isSaving={isSaving}
                    errors={errors}
                />
            </div>
        );
    },
});
